# Car Leave Message App

[DEMO](https://car.ammiratafabiano.dev)

This is a straightforward web application developed to facilitate secure communication between passersby and car owners. The app features a QR code displayed on the car's windshield, enabling individuals who notice issues with the vehicle or need to contact the owner for any reason to send a message securely, without exposing the owner's phone number.

## Key Features

- **Secure Messaging:** Users can send messages to the car owner securely through the app, without revealing the owner's phone number.
- **QR Code Integration:** A unique QR code is prominently displayed on the car's windshield, leading users to the app's website for communication.

## Architecture

- **frontend/** — Ionic/Angular web app
- **backend/** — Node.js/Express API that forwards messages by email (SMTP)

The frontend sends requests to `/api/car/leaveMessage` on the same domain. Apache reverse proxy routes `/api` to the backend container.

## How It Works

- **QR Code Placement:** Affix the provided QR code sticker on your car's windshield, visible to passersby.
- **Message Sending:** Anyone scanning the QR code is redirected to the app's website, where they can send a message to the car owner regarding any issues or concerns.

## Local Development

### Frontend

```bash
cd frontend
npm install
npm start
```

### Backend

```bash
cd backend
npm install
cp .env.example .env
npm start
```

Required backend env vars:

- `CONTACT_EMAIL`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `MAIL_FROM` (optional, defaults to `SMTP_USER`)

## Docker / Deploy

```bash
cd deploy
cp backend.env.example backend.env
docker compose up -d
```

Apache vhost example is available in `deploy/apache-vhost.conf`.

## Language
- **Italian**
- **English**

## Screenshots
<img src="https://github.com/ammiratafabiano/car-leave-message/assets/36988217/11b9b481-469f-4b31-ac0e-159047b29044" alt="drawing" width="200"/>
