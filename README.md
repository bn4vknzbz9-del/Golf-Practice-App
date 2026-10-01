# Golf practice log

A private practice tracker with three sections:

- **Technique**: log the date, the mechanics you worked on, how it went, and how to improve next time.
- **Calibration**: generated 30-minute variability sessions (face strike, low point, clubface direction). Score each drill out of 10 and add notes.
- **Transfer**: generated 30-minute course-style pressure tests. Score each test out of 10, mark pass or fail, and add notes.

Plain HTML, CSS and JavaScript. No build step, no server, no third-party code.

## Put it on GitHub Pages

1. Create a new repository on GitHub.
2. Upload `index.html`, `styles.css`, `app.js` and this `README.md` to the root of the repository.
3. Open **Settings > Pages**. Under **Build and deployment**, choose **Deploy from a branch**, pick `main` and `/ (root)`, then save.
4. After a minute your app is live at `https://<your-username>.github.io/<repo-name>/`.
5. Tick **Enforce HTTPS** on the same Pages screen.

Open the link on your phone and use Add to Home Screen to keep it handy.

## How the login and security work

- On first use you create a passphrase (12+ characters). It is never stored anywhere.
- Your log is encrypted with AES-256-GCM. The key comes from your passphrase through PBKDF2-SHA256 with 600,000 iterations and a random salt.
- Unlocking works by decrypting your data. A wrong passphrase simply fails to decrypt.
- Data stays in your browser's local storage on that device as encrypted text. Nothing is sent to any server, so nothing is stored in your GitHub repository.
- Repeated wrong passphrases trigger growing delays, and the app locks itself after 10 idle minutes (it stays open while a practice timer is running).
- A strict Content-Security-Policy blocks outside scripts and network requests, and all text you enter is displayed as plain text, never as HTML.
- Backups are the same encrypted data, so they are safe to keep in cloud storage.

## What this does not do

No website can promise it is unhackable, and this one is honest about its limits:

- **There is no server, so there is no account.** The login protects the data stored on this device. Your phone and your laptop each have their own separate log. Move data between them with Backup and Restore.
- **A forgotten passphrase cannot be recovered.** Nobody, including you, can decrypt the data without it. Keep backups.
- **Your passphrase is the security.** Use something long and unique. Four or more random words is a good choice. Someone who guesses it can read your log.
- **Someone with your unlocked phone or malware on your device** can see the app while it is open. Lock the app when you are done (the Lock button), and keep your device updated.
- **GitHub Pages cannot set security headers**, so the policy is applied through a meta tag. That covers the important protections but not blocking other sites from framing the page. The app has its own code to refuse that.
- Protect your GitHub account itself with two-factor authentication. Anyone who could edit your repository could change the app code.

If you later want a log that syncs across devices with real accounts, that needs a backend service (for example Supabase or Firebase) and is a separate step.

## Customising

The drill and test lists are at the top of `app.js` under **EDIT ME**. Add, remove or reword entries there. Session lengths are controlled by `CAL_BLOCK_MINUTES` and `TRANSFER_BLOCK_MINUTES`.
