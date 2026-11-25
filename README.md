# Grove

A free assistant that runs on your own device. A Layered Labs experiment, live at https://grove.layeredlabs.ai.

- The model (Qwen2.5 0.5B Instruct, through WebLLM) runs in the browser on WebGPU. Messages never leave the device.
- After the first download it works offline. Chats are saved in the browser's own storage.
- Next.js, plain CSS. Headlines in Fraunces, interface in Hanken Grotesk.

## Develop

```bash
npm install
npm run dev
```

## Deploy

The org repo is private and cannot be git-connected on the Hobby plan, so deploy with the CLI from this folder:

```bash
vercel deploy --prod --yes
```

Bump the cache name in `public/sw.js` (`grove-shell-vN`) whenever shell files change.

## Brand

Logo masters are in `brand/logo/`: the symbol, the two-arch small cut for sizes under 32 px, and the app icon. The mark is three nested arches in one colour, Grove green `#0B6B43` on light, cream `#FFF4D9` on green.
