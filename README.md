> **Bitcoin Roots fork.** This repository builds the Umbrel Bitcoin Node app powered by [Bitcoin Roots](https://bitcoinroots.org) ([LuganoPlanB/bitcoin-roots](https://github.com/LuganoPlanB/bitcoin-roots)) instead of Bitcoin Core. It tracks [`getumbrel/umbrel-bitcoin`](https://github.com/getumbrel/umbrel-bitcoin) and changes only what is needed to swap the node: the bundled binaries (downloaded and verified from Bitcoin Roots releases in `apps/backend/Dockerfile`), the bundled version list, and version-gated settings metadata and defaults in `libs/settings/settings.meta.ts`. Images are published to `ghcr.io/tiero/umbrel-bitcoin-roots` and consumed by the `bitcoin-roots` Umbrel App Store package.

<p align="center">
  <a href="https://apps.umbrel.com/app/bitcoin">
    <img src="https://github.com/user-attachments/assets/b9ff1e96-f899-41e3-8295-3247b88f6f79" alt="Logo">
  </a>
  <h1 align="center">Bitcoin Node</h1>
  <p align="center">
    Run a Bitcoin node on your umbrelOS personal server. An official app by Umbrel. Powered by Bitcoin Core.
    <br />
    <a href="https://umbrel.com"><strong>umbrel.com »</strong></a>
    <br />
    <br />
    <a href="https://twitter.com/umbrel">
      <img src="https://img.shields.io/twitter/follow/umbrel?style=social" />
    </a>
    <a href="https://t.me/getumbrel">
      <img src="https://img.shields.io/badge/community-chat-%235351FB">
    </a>
    <a href="https://reddit.com/r/getumbrel">
      <img src="https://img.shields.io/reddit/subreddit-subscribers/getumbrel?style=social">
    </a>
    <a href="https://community.getumbrel.com">
      <img src="https://img.shields.io/badge/community-forum-%235351FB">
    </a>
  </p>
</p>

## Getting started

This app can be installed in one click from the [Umbrel App Store](https://apps.umbrel.com/app/bitcoin).

---

[![License](https://img.shields.io/github/license/getumbrel/umbrel-bitcoin?color=%235351FB)](https://github.com/getumbrel/umbrel-bitcoin/blob/master/LICENSE.md)

[umbrel.com](https://umbrel.com)