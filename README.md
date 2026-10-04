# Golf practice log

A private practice tracker with these sections:

- **Technique**: a protocol generator (30 to 60 minutes) that moves one mechanic from no club to freezer swings, smoothie swings, a foam ball and then real balls. You tick one or more mechanics from your Settings list (each one gets the stages you pass and the full session time), log sets attempted and whether you completed five good swings in a row at each stage, and a progress ladder shows how far each mechanic has got. A quick log is there too.
- **Calibration**: generated sessions of structured games, one club and one target throughout, from three games (30 minutes) up to six (1 hour), drawn from 32 games that are each 15 balls or fewer. Extra games go to the category you have practised least. Your score for each game is the number of balls that hit.
- **Transfer**: generated sessions of range-friendly games, from three (30 minutes) up to six (1 hour), drawn from seventeen. Clubs and targets change on every ball, and the first game always tests your new move under pressure. Your score is the number of balls that hit (five games keep their own point scores: Range Stableford goes to 24, and Three targets, Infinity levels, Two-ball test and Weakest link go to 10), and you tick Passed at the pass mark.
- **Tempo**: a metronome for a 2:1 short game swing or a 3:1 long game swing. Turn the dial (or use the plus and minus buttons) to any speed from 40 to 300 BPM, so you can start slow. Three tones mark the takeaway, the top of the backswing and impact: the first two are the same low click and impact is a higher ping. Each tone has a light, and a bar below has one cell per beat (numbered), which fills over exactly that beat, then a pause cell. The pause between swings is set in seconds (1 to 8, default 4). Preset buttons jump to common backswing/downswing frame counts (3:1 long game 27/9, 24/8, 21/7, 18/6; 2:1 short game 20/10, 18/9, 16/8, 14/7), counted at 30 frames per second, and the spacing is exact to the frame. Options add a soft click inside the backswing and a delay for the lights, because Bluetooth speakers and headphones play the sound a little late. The tones play through your media volume and keep a silent media track running, so the silent switch should not mute them. A Log tab saves the date, the ratio and speed you used, and your notes, and they also appear in the Practice log.
- **Practice trends**: the hours spent on each technique change as a bar chart (under 10 hours red, 10 to 15 amber, 15 to 20 light green, over 20 dark green and labelled Course Ready), plus calibration and transfer progress over time as the share of balls that hit.

- **Practice log**: every session in one place, newest first, with the drills, notes and scores for each. Filter by Technique, Calibration or Transfer. Each calibration and transfer session shows its average score as a percentage of the maximum.

The session timer keeps running with the screen locked and sounds an alarm at the end. A phone keeps playing audio when it locks, so the app plays one track that is silent for the time left and then beeps for 30 seconds. The alarm is a sound made by the app and plays at your media volume. It is not the Clock app's alarm tone. The timer also keeps your screen awake while it runs, where the browser allows, and shows a Stop alarm button when it rings.

Each practice tab has a session length slider from 30 minutes to 1 hour in 10 minute steps, which changes the number of drills. Settings has a **Mechanic options** list: add the mechanics you work on there, and they appear in the Mechanic dropdown so every session is logged under the same name.

The methods draw on Dr Luke Benoit's freezer, smoothie and foam-ball progression, his Impact Opposites idea (learn the edges to find the centre) and his advice to add variety and pressure for transfer, plus Adam Young's Diagnose, Intervene, Refine, Transfer structure, his strike boundaries, and his transference games (Infinity, Perfection, Two-ball test, Gambler, Worst shot, Danger side, Weakest link and the wide-or-narrow target game). The games are my adaptations and are not their official programmes.

The look follows Apple's iOS design: system fonts and colours, grouped lists, a translucent top bar and tab bar with icons, iOS-style sliders and switches between light and dark mode automatically. Each area has its own colour (Technique purple, Calibration blue, Transfer orange, Practice trends teal, Practice log indigo), and drill cards are colour-coded by category using the same colours as the chart lines.

Plain HTML, CSS and JavaScript. No build step, no server, no third-party code.

## Put it on GitHub Pages

1. Create a new repository on GitHub.
2. Upload `index.html`, `styles.css`, `app.js` and this `README.md` to the root of the repository.
3. Open **Settings > Pages**. Under **Build and deployment**, choose **Deploy from a branch**, pick `main` and `/ (root)`, then save.
4. After a minute your app is live at `https://<your-username>.github.io/<repo-name>/`.
5. Tick **Enforce HTTPS** on the same Pages screen.

Open the link on your phone and use Add to Home Screen to keep it handy.

## Target sizes and the range converter

Drill target sizes are written in yards with feet in brackets. Games that name their clubs (Infinity levels, Perfection ladder, Wide or narrow) have fixed sizes for a wedge of about 100 yards, a mid-iron of about 150 yards and a driver of about 250 yards.

Every other drill with target sizes has a "Name your club to size the windows" picker on its card: wedge (about 100 yards), short iron (125), mid-iron (150, the default), long iron or hybrid (200) or driver (250). Picking a club rescales the windows to that distance, and the choice is saved with the session. A drill that begins "A mid-iron" names the club you picked instead.

If you want to judge a width by eye, each calibration and transfer session has a "Yards to fingers" slider: set your shot distance and a target width in yards, and it shows how many fingers wide that target looks. One finger is about 3.3% of the shot distance, which is 3.3 yards at 100 yards, 5 yards at 150 yards and 6.6 yards at 200 yards.

## Scores as a percentage of the maximum

Each calibration and transfer session shows its average score as a percentage of the maximum. Every drill is scored against its own maximum (balls hit, or points for the games scored in points), and the drills in a session are averaged. Practice trends charts that percentage over time for each calibration category and for all drills, and for transfer by game type (Course simulation, Pressure game and Scoring game), for the new-move game and for all games. The charts are line charts over your sessions, oldest to newest.

## Who can use the app (invite codes)

The app is by invitation. A visitor sees only an invite screen. The app itself (`app.js`) is not loaded until a valid invite code has been entered on that device, and each person gets their own code.

- **Files:** `index.html`, `access-core.js`, `gate.js`, `access.json`, `admin.html`, `admin.js`, `app.js` and `styles.css` all go in the repository root.
- **First code:** `access.json` ships with one invite for you (the owner). Its code was given to you separately. `access.json` holds only a salted hash of each code, never the code, so it is safe in a public repository.
- **Add someone:** open `https://<you>.github.io/<repo>/admin.html`, paste your current `access.json`, type their name, tap Make an invite code, send them the code, then copy the new `access.json` back into GitHub (open the file, tap the pencil, replace everything, commit).
- **Remove someone:** open the same page, paste the current `access.json`, tap Remove next to their name, and save the new file the same way. Their app stops opening the next time they open it online. It can take about ten minutes for GitHub to publish the change. Anything they already have open keeps working until they reload, and their saved log stays on their phone but they can no longer open the app.
- **No signal:** an invite that was valid at its last check keeps working for 30 days without a connection.
- **Wrong guesses:** three wrong codes in a row make the screen wait, and each code has 60 bits of randomness, so guessing is not practical.

What this does and does not do: GitHub Pages is a public host, so this is a lock on the front door of your link, not a vault. It keeps casual visitors out and lets you decide who has a code. It cannot stop someone you invited from passing their code on, or someone technical from copying the public files into their own copy of the app. If you need to shut out a person immediately and for certain, move the site behind a host with sign-in, for example Cloudflare Access, which can allow only the email addresses you list.

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
