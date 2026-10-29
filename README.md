# CRDent — Diş Kliniği Modüler CRM

CRDent, diş klinikleri için modüler, mobil uyumlu, rol tabanlı erişimli bir CRM/SaaS yazılımıdır. Portainer (Docker) üzerinde çalışır, Cloudflare ile yönlendirme yapılır. GitHub'dan otomatik deploy edilir.

## Hasta Yolculuğu

```
Lead (Kampanya / Meta / Web / WhatsApp / Instagram)
  → Çağrı Merkezi (telefonla hasta bilgisi alınır)
  → Satışçıya ilk randevu (Ücretsiz Ön Muayene / Görüşme)
  → Tedavi planı çıkarılır → Hasta onaylar
  → Banko ödeme alır, fatura keser, taksit planı oluşturur
  → Doktor tedaviyi uygular
  → Banko sonrası tedavi randevuları verir
  → Çağrı Merkezi de tedavi randevusu verebilir
```

## Rol Bazlı Ekranlar

| Rol | Ekran | Ana İşlemler |
|-----|-------|-------------|
| Çağrı Merkezi | Çağrı Merkezi Paneli | Lead girişi, hasta kayıt, randevu oluşturma |
| Satışçı | Satışçı Paneli | Ön muayene, tedavi planı, lead yönetimi |
| Doktor | Doktor Paneli | Tıbbi kart, diş şeması, tedavi |
| Banko | Banko Paneli | Ödeme, fatura, taksit, gelir raporu |
| Yönetici | Yönetici Paneli | Tüm raporlar, kullanıcı yönetimi, kampanya onayı |

## Teknoloji Stack

- **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS + Zustand + React Hook Form + TanStack Query
- **Backend:** Node.js + Express + TypeScript + Prisma ORM + PostgreSQL + JWT
- **Container:** Docker + Docker Compose + Portainer
- **CI/CD:** GitHub Actions

## Port Dağılımı (Dış Portlar)

| Hizmet | Dış Port | Açıklama |
|--------|----------|----------|
| Frontend | 4000 | Kullanıcı arayüzü |
| Backend API | 4001 | REST API |
| PostgreSQL | 4002 | Veritabanı |
| Redis | 4003 | Kuyruk (opsiyonel) |
| Adminer | 4004 | DB GUI |

## Kurulum

1. Repoyu klonlayın:
   ```bash
   git clone <repo-url>
   cd CRDent
   ```

2. Backend `.env` dosyasını yapılandırın:
   ```bash
   cd backend
   cp .env.example .env
   # DATABASE_URL, JWT_SECRET, META ve SMS ayarlarını düzenleyin
   ```

3. Portainer ile deploy edin:
   ```bash
   docker-compose up -d
   ```

4. Tarayıcıdan erişin (Cloudflare ile domain yönlendirmesi yapın):
   - Frontend: `http://sunucu-ip:4000`
   - Backend API: `http://sunucu-ip:4001`

## Veritabanı Migration

```bash
cd backend
npx prisma generate
npx prisma migrate deploy
```

## Lisans

Özel - CRDent Diş Kliniği CRM
