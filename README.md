# Golf practice log

A private practice tracker with three sections:

- **Technique**: a 30-minute protocol generator that moves one mechanic from no club to freezer swings, smoothie swings, a foam ball and then real balls. You log sets attempted and whether you completed five good swings in a row at each stage, and a progress ladder shows how far each mechanic has got. A quick log (date, mechanics, notes, how to improve) is still there too.
- **Calibration**: generated 30-minute sessions of three structured games, one each for face strike, low point and clubface direction, drawn from 11 to 13 games per category. Your club and target never change. Each game steps one thing through a fixed order, from one extreme to the other and in toward the centre, and then switches between strike positions, contact types, shot shapes or start lines from ball to ball. A new session avoids the games you used in your last two sessions.
- **Transfer**: generated 30-minute sessions of three range-friendly games, drawn from seventeen. Clubs and targets change on every ball, you use your full routine, and there is a consequence for a miss. The first game always tests your new move under pressure. Score each game out of 10, mark pass or fail, and add notes.

Target sizes are in fingers. One finger is about 3.3 yards at 100 yards, 5 yards at 150 and 6.6 yards at 200 (distance x 0.033). Each session page has a calculator that turns your shot distance into yards per finger.

The methods draw on Dr Luke Benoit's freezer, smoothie and foam-ball progression, his Impact Opposites idea (learn the edges to find the centre) and his advice to add variety and pressure for transfer, plus Adam Young's Diagnose, Intervene, Refine, Transfer structure, his strike boundaries, and his transference games (Infinity, Perfection, Two-ball test, Gambler, Worst shot, Danger side, Weakest link and the wide-or-narrow target game). The games are my adaptations and are not their official programmes.

Plain HTML, CSS and JavaScript. No build step, no server, no third-party code.

## Put it on GitHub Pages

1. Create a new repository on GitHub.
2. Upload `index.html`, `styles.css`, `app.js` and this `README.md` to the root of the repository.
3. Open **Settings > Pages**. Under **Build and deployment**, choose **Deploy from a branch**, pick `main` and `/ (root)`, then save.
4. After a minute your app is live at `https://<your-username>.github.io/<repo-name>/`.
5. Tick **Enforce HTTPS** on the same Pages screen.

Open the link on your phone and use Add to Home Screen to keep it handy.

## Finger widths

Targets are sized in fingers, as in Adam Young's transference games. One finger width is about 3.3 yards at 100 yards, 5 yards at 150 yards and 6.6 yards at 200 yards. Each session page has a calculator: type your shot distance to see how wide a finger is.

## How the login and security work

- On first use you create a passphrase (12+ characters). It is never stored anywhere.
- Your log is encrypted with AES-256-GCM. The key comes from your passphrase through PBKDF2-SHA256 with 600,000 iterations and a random salt.
- Unlocking works by decrypting your data. A wrong passphrase simply fails to decrypt.
- Data stays in your browser's local storage on that device as encrypted text. Nothing is sent to any server, so nothing is stored in your GitHub repository.
- Repeated wrong passphrases trigger growing delays, and the app locks itself after 10 idle minutes (it stays open while a practice timer is running).
- A strict Content-Security-Policy blocks outside scripts and network requests, and all text you enter is displayed as plain text, never as HTML.
- Backups are the same encrypted data, so they are safe to keep in cloud storage.
- The app asks your browser to protect its storage from automatic clearing, and reminds you to back up if you haven't in a week. Clearing Safari history or website data can still erase the log, so keep a recent backup in iCloud Drive.

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

The calibration and transfer games are at the top of `app.js` under **EDIT ME**, and the protocol stages and timings are just below them. Add, remove or reword entries there. Session lengths are controlled by `CAL_BLOCK_MINUTES`, `TRANSFER_BLOCK_MINUTES` and `PROTO_PLANS`.
