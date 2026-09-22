# Canlıya Çıkış: Dağıtım Mimarisi ve Araçlar

TTK Misafirhane Bilgi Sistemi — kurulum önerisi.
Bu belge «Kubernetes mi, değil mi?» sorusunu ölçeğe göre yanıtlar ve önerilen
araç zincirini adım adım anlatır.

---

## 1. Önce dürüst bir ölçek değerlendirmesi

| Büyüklük | Değer |
|---|---|
| Eşzamanlı kullanıcı | ~20–40 (4 misafirhane resepsiyonu + müdürler + muhasebe) |
| Günlük işlem | birkaç yüz kayıt/tahsilat |
| Veri | ~250 MB/yıl |
| Kritiklik | Kurum içi; kesinti can/mal kaybına yol açmaz ama günlük işi durdurur |

**Bu ölçek Kubernetes'i zorunlu kılmaz.** Kubernetes'i seçmek, uygulamayı değil,
*işletme biçimini* seçmektir: küme yönetimi, sertifika, ağ politikası, depolama
sınıfı, yükseltme döngüsü — hepsi ayrı bir uzmanlıktır. Üç seçenek:

| Seçenek | Ne zaman doğru | Emek |
|---|---|---|
| **A. Tek sunucu + Docker Compose** | Kurumda Kubernetes işleten bir ekip **yoksa**; tek veri merkezi yeterliyse | Düşük |
| **B. Kubernetes (önerilen orta yol)** | TTK Bilgi İşlem'de zaten bir küme **varsa** ya da başka modüller de taşınacaksa | Orta |
| **C. Çoklu bölge, otomatik ölçeklenen küme** | Bu modül için **gereksiz** | Yüksek |

> **Öneri:** Kurumda hâlihazırda bir Kubernetes kümesi işletiliyorsa **B**; yoksa
> **A ile başlayıp** modül sayısı arttığında B'ye geçin. A'dan B'ye geçiş, aynı
> konteyner imajları kullanıldığı için ucuzdur — bu yüzden **ilk günden konteynerleştirin.**

---

## 2. Bileşenler

```
                       ┌──────────────────────────┐
  Tarayıcı / telefon → │  Nginx / Traefik (TLS)    │  ttknet.ttk.gov.tr
                       └───────────┬──────────────┘
                     ┌─────────────┴─────────────┐
                     │                           │
            ┌────────▼────────┐        ┌─────────▼─────────┐
            │  web (statik)   │        │  api (Node/NestJS │
            │  React derlemesi│        │  ya da .NET/Java) │
            └─────────────────┘        └─────────┬─────────┘
                                                 │
                    ┌────────────────┬───────────┼─────────────┬──────────────┐
                    │                │           │             │              │
            ┌───────▼──────┐ ┌───────▼──────┐ ┌──▼─────────┐ ┌─▼──────────┐ ┌─▼────────┐
            │ PostgreSQL   │ │ MinIO (S3)   │ │ Redis      │ │ SMS ağ geç.│ │ LDAP/YBS │
            │ (Patroni HA) │ │ dekont/belge │ │ oturum,kuy.│ │ (kurum)    │ │ kimlik   │
            └──────────────┘ └──────────────┘ └────────────┘ └────────────┘ └──────────┘
```

| Bileşen | Seçim | Not |
|---|---|---|
| Ters vekil / TLS | **Traefik** (K8s) veya **Nginx** (Compose) | Sertifika: kurum içi CA ya da Let's Encrypt |
| Arayüz | React derlemesi, statik dosyalar | Prototipteki tek dosya, Vite ile gerçek projeye bölünür |
| Uygulama sunucusu | **NestJS (Node 22)** — ya da kurumun yetkin olduğu .NET 8 / Spring Boot | Karar ölçütü: **ekibin bildiği dil**. Üçü de yeterlidir |
| Veritabanı | PostgreSQL 16 (bkz. [`veritabani.md`](veritabani.md)) | K8s'te **CloudNativePG** operatörü |
| Dosya deposu | MinIO | Dekont ve ay sonu belgeleri veritabanına konmaz |
| Önbellek/kuyruk | Redis | Oturum, SMS kuyruğu, gecelik işler |
| Kimlik | Kurumun LDAP/Active Directory'si | Prototipteki kullanıcı tablosu yerine; yetki eşleştirmesi uygulamada kalır |
| SMS | Kurumun sözleşmeli sağlayıcısı | Kuyruk üzerinden, yeniden deneme ile |

---

## 3. Seçenek A — Tek sunucu, Docker Compose

Bir sanal sunucu (8 vCPU / 16 GB RAM / 200 GB SSD) yeter.

```yaml
# docker-compose.yml  (özet)
services:
  db:
    image: postgres:16
    environment: { POSTGRES_DB: msfh, POSTGRES_USER: msfh }
    secrets: [db_sifre]
    volumes: [ "pgdata:/var/lib/postgresql/data" ]
    healthcheck: { test: ["CMD-SHELL", "pg_isready -U msfh"], interval: 10s }
  api:
    image: registry.ttk.gov.tr/msfh/api:${SURUM}
    depends_on: { db: { condition: service_healthy } }
    environment: { DATABASE_URL: postgres://msfh@db/msfh, NODE_ENV: production }
    deploy: { replicas: 2 }
  web:
    image: registry.ttk.gov.tr/msfh/web:${SURUM}
  minio:
    image: quay.io/minio/minio
    command: server /data --console-address ":9001"
    volumes: [ "minio:/data" ]
  proxy:
    image: nginx:alpine
    ports: [ "443:443" ]
    volumes: [ "./nginx.conf:/etc/nginx/nginx.conf:ro", "./certs:/certs:ro" ]
volumes: { pgdata: {}, minio: {} }
```

Yedekleme: `pgbackrest` konteyneri + gecelik `restic` ile MinIO kovasının kopyası.
İzleme: `docker compose logs` yerine **Loki + Promtail**, ölçüm için **Prometheus + Grafana**.

**Artısı:** bir günde kurulur, tek kişi işletir.
**Eksisi:** sunucu bakımı sırasında kesinti olur; yatay ölçekleme elle yapılır.

---

## 4. Seçenek B — Kubernetes (önerilen kurumsal yol)

### 4.1 Küme
- **Dağıtım:** kurum içi için **RKE2** ya da **k3s** (hafif, CIS sertifikalı); bulut kullanılacaksa yönetilen küme.
- **Boyut:** 3 kontrol düzlemi + 3 işçi düğüm (her biri 4 vCPU / 16 GB). Bu modül tek başına 1 düğümü bile doldurmaz; küme başka modüllerle paylaşılır.
- **Depolama:** Longhorn ya da kurumun SAN'ı üzerinden CSI.

### 4.2 Uygulama nesneleri

```yaml
# api-deployment.yaml (özet)
apiVersion: apps/v1
kind: Deployment
metadata: { name: msfh-api, namespace: msfh }
spec:
  replicas: 3
  strategy: { type: RollingUpdate, rollingUpdate: { maxUnavailable: 0, maxSurge: 1 } }
  template:
    spec:
      containers:
        - name: api
          image: registry.ttk.gov.tr/msfh/api:2.6.0
          envFrom: [{ secretRef: { name: msfh-db } }]
          resources:
            requests: { cpu: 200m, memory: 256Mi }
            limits:   { cpu: "1",  memory: 512Mi }
          readinessProbe: { httpGet: { path: /saglik/hazir, port: 3000 }, initialDelaySeconds: 5 }
          livenessProbe:  { httpGet: { path: /saglik/canli, port: 3000 }, periodSeconds: 20 }
          securityContext:
            runAsNonRoot: true
            readOnlyRootFilesystem: true
            allowPrivilegeEscalation: false
---
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata: { name: msfh-api }
spec: { minAvailable: 2, selector: { matchLabels: { app: msfh-api } } }
```

**Veritabanı için operatör kullanın, elle StatefulSet yazmayın:**

```yaml
apiVersion: postgresql.cnpg.io/v1
kind: Cluster
metadata: { name: msfh-db, namespace: msfh }
spec:
  instances: 3                      # 1 birincil + 2 yedek, otomatik devralma
  postgresql:
    parameters: { max_connections: "200", shared_buffers: "2GB" }
  bootstrap: { initdb: { database: msfh, owner: msfh } }
  backup:
    barmanObjectStore:
      destinationPath: s3://msfh-yedek/
      s3Credentials: { accessKeyId: { name: minio, key: id }, secretAccessKey: { name: minio, key: key } }
    retentionPolicy: "90d"
  storage: { size: 100Gi, storageClass: longhorn }
```

CloudNativePG; devralma, yedek, PITR ve yükseltmeyi kendi yönetir — Kubernetes'te
veritabanı işletmenin en büyük riski budur ve operatör bu riski üstlenir.

### 4.3 Ağ ve güvenlik
- **Ingress:** Traefik + cert-manager (kurum CA ya da ACME).
- **NetworkPolicy:** `api` yalnız `db`, `redis`, `minio` ve SMS ağ geçidine çıkabilir; `web` hiçbirine.
- **Gizli bilgiler:** **External Secrets Operator** ile HashiCorp Vault'tan; düz `Secret` nesnesi git'e girmez.
- **İmaj güvenliği:** Trivy taraması boru hattında; imzalama için cosign; `imagePullPolicy: IfNotPresent` + sabit sürüm etiketi (asla `latest`).
- **Pod Security:** `restricted` profili.

### 4.4 Dağıtım yöntemi — GitOps
```
git (altyapi deposu)  →  Argo CD  →  küme
```
- Ortamlar: `dev` / `test` / `prod` ayrı namespace ya da ayrı küme.
- **Helm** ya da **Kustomize** ile şablon; sürüm yükseltmesi = git'te imaj etiketini değiştirmek.
- Geri alma: `argocd app rollback` ya da git'te bir önceki commit.

### 4.5 Veritabanı göçleri
- Şema göçleri **ayrı bir Job** olarak, uygulama başlamadan önce çalışır:
  `helm.sh/hook: pre-upgrade`. Araç: Flyway, Liquibase ya da Prisma Migrate.
- **Kural:** göçler geriye uyumlu olmalı (önce sütun ekle, sonra kod, sonra eski sütunu kaldır) — böylece dönüşümlü güncellemede eski ve yeni sürüm bir arada çalışabilir.

---

## 5. Sürekli tümleştirme boru hattı

```
GitLab CI / GitHub Actions
  1. lint + birim testleri
  2. Playwright uçtan uca testleri        ← bu depodaki testler/ dizini
  3. docker build + Trivy taraması + cosign imzası
  4. registry.ttk.gov.tr'ye itme
  5. Argo CD'nin izlediği depoda imaj etiketini güncelleme (dev)
  6. test ortamında onay → prod'a yükselt
```

Bu depodaki `testler/tumu.mjs` doğrudan 2. adımda kullanılabilir: kalan denetim
varsa çıkış kodu 1 döner, boru hattı durur.

---

## 6. İzleme ve uyarı

| Katman | Araç | Bakılacak |
|---|---|---|
| Ölçüm | Prometheus + Grafana | İstek gecikmesi, hata oranı, doluluk oranı (iş ölçütü olarak) |
| Günlük | Loki + Promtail | Uygulama günlükleri, denetim izi ayrı akışta |
| İzleme (trace) | OpenTelemetry + Tempo | Yavaş yerleştirme sorgularını bulmak için |
| Uyarı | Alertmanager → e-posta/SMS | DB devralma, disk %80, 5xx oranı, yedek başarısız |
| İş uyarısı | Uygulama içi | Kapora son ödeme tarihi geçenler, onay bekleyen dekont sayısı |

**Sağlık uçları:** `/saglik/canli` (süreç ayakta mı), `/saglik/hazir` (DB'ye bağlı mı).
İkisini ayırmak önemlidir; DB kısa süre yanıt vermediğinde pod'un yeniden başlatılması
sorunu büyütür.

---

## 7. Yayına alma sırası (öneri)

| Aşama | Süre | İçerik |
|---|---|---|
| 0. Hazırlık | 2 hafta | Şema, ortamlar, boru hattı, LDAP bağlantısı |
| 1. Salt okunur pilot | 3 hafta | Yeni arayüz, veri Oracle'dan gecelik kopya; tek misafirhane |
| 2. Çift yazma | 3 hafta | Yeni sistemde de kayıt açılır, gece mutabakat raporu |
| 3. Devralma | 1 hafta | Tek misafirhane tamamen yeni sisteme geçer, Oracle salt okunur |
| 4. Yaygınlaştırma | 4 hafta | Diğer üç misafirhane sırayla |
| 5. Kapanış | — | Oracle Forms modülü arşive alınır |

**Geri dönüş planı:** her aşamada Oracle tarafı bir hafta daha yazılabilir tutulur;
sorun çıkarsa DNS bir kayıtla eski sisteme döner.

---

## 8. Maliyet ve emek özeti

| Kalem | Seçenek A | Seçenek B |
|---|---|---|
| Sunucu | 1 VM | 6 düğüm (paylaşımlı küme) |
| Kurulum emeği | ~1 hafta | ~3 hafta (küme yoksa +4 hafta) |
| İşletme | 1 kişi, yarı zamanlı | Var olan platform ekibi |
| Kesintisiz güncelleme | Hayır (kısa kesinti) | Evet |
| Lisans | Yok (tümü açık kaynak) | Yok |

**Karar:** Kubernetes'i bu modül için *tek başına* kurmayın. Kurumda küme varsa
kullanın; yoksa Compose ile çıkın, konteynerleri hazır tutun, küme geldiğinde taşıyın.

---

## 9. Boyutlandırma

Ölçüm değil, hesap: 40 eşzamanlı kullanıcı, kullanıcı başına dakikada ~4 istek
⇒ **~3 istek/saniye**. Yerleştirme önerisi en ağır işlem (~50 ms CPU).

| Bileşen | İstek (request) | Sınır (limit) | Örnek | Gerekçe |
|---|---|---|---|---|
| api | 200m CPU / 256 Mi | 1 CPU / 512 Mi | 3 | Tek örnek bile yükü kaldırır; 3 örnek kesintisiz güncelleme ve arıza payı içindir |
| web (statik) | 50m / 64 Mi | 200m / 128 Mi | 2 | Yalnız dosya sunar |
| PostgreSQL | 1 CPU / 4 Gi | 2 CPU / 8 Gi | 3 (1 birincil + 2 yedek) | `shared_buffers` 2 GB |
| MinIO | 200m / 512 Mi | 1 CPU / 2 Gi | 2 | Dekont ve belgeler |
| Redis | 100m / 128 Mi | 500m / 512 Mi | 1 | Oturum ve kuyruk |

**Disk:** veritabanı 100 Gi (20 yıllık veri + dizin + yedek alanı payı), MinIO 200 Gi
(dekont taramaları ~200 KB × yılda ~3.000 adet ⇒ 0,6 GB/yıl; bolca pay bırakılmıştır).

---

## 10. İşletme el kitabı (runbook)

Gece yarısı arandığında bakılacaklar. Bu bölüm sistemi devralacak kişiye verilir.

### 10.1 «Uygulama açılmıyor»
```bash
# K8s
kubectl -n msfh get pods                       # pod durumları
kubectl -n msfh logs deploy/msfh-api --tail=100
kubectl -n msfh describe pod <pod>             # olaylar: imaj çekilemedi? bellek?
# Compose
docker compose ps && docker compose logs --tail=100 api
```
Sık neden: veritabanı hazır değil (`readinessProbe` başarısız). `msfh-db` durumuna bakın.

### 10.2 «Veritabanı yanıt vermiyor»
```bash
kubectl -n msfh get cluster msfh-db            # CloudNativePG durumu
kubectl -n msfh cnpg status msfh-db            # birincil kim, gecikme ne
```
Devralma kendiliğinden olur (~15 sn). Olmuyorsa:
```bash
kubectl -n msfh cnpg promote msfh-db msfh-db-2
```

### 10.3 Yedekten dönüş (PITR)
```yaml
# Belirli bir ana dönmek için yeni küme oluşturulur, eskisi bozulmaz
apiVersion: postgresql.cnpg.io/v1
kind: Cluster
metadata: { name: msfh-db-kurtarma }
spec:
  instances: 1
  bootstrap:
    recovery:
      source: msfh-db
      recoveryTarget: { targetTime: "2026-09-22 14:30:00+03" }
  externalClusters:
    - name: msfh-db
      barmanObjectStore: { destinationPath: s3://msfh-yedek/, ... }
```
Doğrulandıktan sonra uygulama yeni kümeye yönlendirilir.
**Compose'da:** `pgbackrest --stanza=msfh --type=time --target="..." restore`

### 10.4 Sürüm yükseltme / geri alma
```bash
# GitOps: imaj etiketi değiştirilir, Argo CD uygular
argocd app sync msfh
argocd app history msfh
argocd app rollback msfh <önceki-numara>
```
**Şema göçü geri alınamaz.** Bu yüzden göçler geriye uyumlu yazılır (§ 4.5);
sütun silme, bir sonraki sürümde ayrı bir adım olarak yapılır.

### 10.5 Rutin bakım takvimi

| Sıklık | İş |
|---|---|
| Günlük | Yedek başarı bildirimi, disk kullanımı, hata oranı |
| Haftalık | En yavaş 10 sorgu (`pg_stat_statements`), güvenlik yamaları |
| Aylık | Trivy imaj taraması, bağımlılık güncellemesi |
| 6 ayda bir | **Yedekten dönüş tatbikatı** — yapılmayan tatbikat, yedek yok demektir |
| Yıllık | PostgreSQL ana sürüm yükseltmesi değerlendirmesi |

---

## 11. Devreye alma kontrol listesi

Canlıya çıkmadan önce hepsi işaretlenmeli:

- [ ] TLS sertifikası geçerli, otomatik yenileme çalışıyor
- [ ] LDAP/AD bağlantısı test edildi; AD grubu → rol eşleştirmesi doğrulandı
- [ ] Yetki denetimi **sunucuda** yapılıyor (arayüzdeki gizleme tek başına güvenlik değildir)
- [ ] `EXCLUDE` kısıtı üretim şemasında var ve çakışma denemesi reddediliyor
- [ ] Yedek alınıyor **ve** yedekten dönüş bir kez denendi
- [ ] İzleme ve uyarılar kuruldu, alarm bir kişiye ulaşıyor
- [ ] SMS sağlayıcısı üretim anahtarıyla test edildi, kota biliniyor
- [ ] KVKK aydınlatma metni yerinde, saklama süresi işi tanımlı
- [ ] Denetim izi (`hareket`) yazılıyor ve silinemiyor
- [ ] Geri dönüş planı yazılı ve sorumlusu belli
- [ ] Kullanıcı eğitimi yapıldı, uygulama içi rehber güncel
- [ ] Bu belge ve [`veritabani.md`](veritabani.md) sistemi devralacak kişiye teslim edildi
