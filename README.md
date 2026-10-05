# Golf practice log

A private practice tracker with these sections:

- **Technique**: a protocol generator (30 to 60 minutes) that moves one mechanic from no club to freezer swings, smoothie swings, a foam ball and then real balls. You tick one or more mechanics from your Settings list (each one gets the stages you pass and the full session time), log sets attempted and whether you completed five good swings in a row at each stage, and a progress ladder shows how far each mechanic has got. A quick log is there too.
- **Calibration**: generated sessions of structured games, one club and one target throughout, from three games (30 minutes) up to six (1 hour), drawn from 32 games that are each 15 balls or fewer. Extra games go to the category you have practised least. Your score for each game is the number of balls that hit.
- **Transfer**: generated sessions of range-friendly games, from three (30 minutes) up to six (1 hour), drawn from seventeen. Clubs and targets change on every ball, and the first game always tests your new move under pressure. Your score is the number of balls that hit (five games keep their own point scores: Range Stableford goes to 24, and Three targets, Infinity levels, Two-ball test and Weakest link go to 10), and you tick Passed at the pass mark.
- **Tempo**: a metronome for a 2:1 short game swing or a 3:1 long game swing. The dial is a knob like the one on a stereo: grab it and turn it, with no jump, to any speed from 80 to 300 BPM, and it stops at both ends. One BPM is just over one degree of turn. The knob is geared down, so about 3 degrees of finger travel changes the speed by 1 BPM; the printed scale is for reading only. Use the arrow keys for single steps. A small marker on the scale shows each preset, and you can also tap a preset below. Three tones mark the takeaway, the top of the backswing and impact, and each is a little higher in pitch than the one before. Each tone has a light (the impact light is green). Below them, one continuous line of boxes shows the beats: 7 boxes in the long game and 4 in the short game, then a single small box, half the width of the others, for the rest. The boxes have no numbers. Each tone sounds exactly as its box begins and that box is outlined and labelled in the same colour as its light: takeaway pink, top of the backswing blue and impact green. The boxes fill pink up to the top of the backswing, blue from the top to impact, and green at impact. In the long game takeaway is box 1, top is box 5 and impact is box 7, and in the short game they are boxes 1, 3 and 4. Each box fills until the next one begins. The rest box fills slowly over the whole rest, which is 5 beats in the long game and 3 in the short game, so it takes that many times longer to fill than another box. The soft clicks sound on every beat that has no tone, through the rest as well. Stop silences the sound at once, including tones already scheduled ahead. If the phone interrupts the sound (a call, a notification), the app tries to restart it and carries on; if the phone will not allow that, it stops and tells you to tap Start, instead of freezing with every box full. Presets are backswing/downswing frame counts at 30 frames per second: 3:1 long game 39/13, 36/12, 33/11, 30/10, 27/9, 24/8, 21/7, 18/6 and 2:1 short game 20/10, 18/9, 16/8, 14/7. In the long game the top of the backswing comes exactly 27 frames (at 27/9) after the takeaway, the impact tone comes a little later than one beat after the top (about 0.49 s at 27/9) and the rest is as long as the swing from takeaway to impact (about 1.39 s at 27/9). That spacing was measured from recordings of 21/7, 27/9 and 30/10 and matches them to within 1 ms; the other long game speeds use a curve fitted to those three, so they are estimates. The short game keeps whole beats with a rest of 4 beats. An option adds a soft click on the other beats. The lights are drawn from the moment the sound is heard, and a light sync saved earlier on a phone is still applied, although there is no longer a screen to change it. The tones play through your media volume and keep a silent media track running, so the silent switch should not mute them. A Log tab saves the date, the ratio and speed you used, and your notes, and they also appear in the Practice log.
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

## Who can use the app (access phrase)

The app is private. A visitor sees only a phrase screen. The app itself (`app.js`) is not loaded until the access phrase has been entered on that phone. There is one phrase for everyone you let in, which makes it easy to keep track of. It never expires.

- **Files:** `index.html`, `access-core.js`, `gate.js`, `access.json`, `admin.html`, `admin.js`, `app.js` and `styles.css` all go in the repository root.
- **The phrase:** four short words such as `zezi-mati-nuro-lego`. Capital letters, spaces and dashes do not matter when it is typed. `access.json` holds only a salted hash of the phrase, never the phrase, so it is safe in a public repository.
- **Give someone access:** send them the phrase. Each phone remembers it after the first time.
- **Lock someone out, or change the phrase:** open `https://<you>.github.io/<repo>/admin.html`, tap Suggest a phrase, tap Make access.json, copy the file into GitHub (open `access.json`, tap the pencil, replace everything, commit) and send the new phrase to the people you still want. Everyone else is stopped the next time they open the app online. GitHub can take about ten minutes to publish the change. Saved logs stay on their phones, but they cannot open the app without the phrase.
- **Not sure which phrase is live?** The second box on the admin page tests any phrase against the `access.json` on your site and tells you yes or no.
- **If you forget the phrase:** make a new one on the admin page. You only need to be able to edit the repository.
- **No signal:** a phone that was let in keeps working for 30 days without a connection.
- **Wrong guesses:** three wrong tries in a row make the screen wait. A suggested phrase has about 50 bits of randomness, so guessing is not practical. If you type your own, make it at least four unrelated words, because anyone can read the file and try guesses against it.

What this does and does not do: GitHub Pages is a public host, so this is a lock on the front door of your link, not a vault. It keeps casual visitors out and lets you decide who has the phrase. It cannot stop someone you told from passing it on, or someone technical from copying the public files into their own copy of the app. If you need to shut out one person immediately and for certain, move the site behind a host with sign-in, for example Cloudflare Access, which can allow only the email addresses you list.

## If a page is blank or stuck on "Loading"

The pages now say what is wrong. A message that stays on screen names the files to check. Most often a file is missing from the repository, or was saved with a different name (for example `admin (1).js` or `access-core 2.js`). Every file must sit in the repository root with exactly the names in this list: `index.html`, `access-core.js`, `gate.js`, `access.json`, `admin.html`, `admin.js`, `app.js`, `styles.css`. To check one, open `https://YOUR-USERNAME.github.io/YOUR-REPO-NAME/admin.js` in the browser. You should see code. If you see "404", that file is not published yet.

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

## Colours and folded text

The Technique, Calibration, Transfer and Tempo tabs each use their own colour (purple, blue, orange and pink) for buttons, links, switches and sliders. The Practice trends and Practice log tabs stay green, and the Lock and Settings buttons stay green on every tab. The mechanic list on the Technique tab no longer scrolls inside itself, so the page always scrolls smoothly past it; a long list shows its first 8 mechanics with a button to show the rest. On the Technique tab, the "How this works" text and each block's instructions start folded away behind a button. The first block of a protocol is now called Set your goal; older saved sessions are renamed to match when they open.

## Editing past sessions

Open any saved session in the Practice log, or in the History of its own tab, and tap Edit. It opens in the same form you used to record it, filled in with what you saved, so you can change the date, scores, passes, notes and, for a technique protocol, its mechanics and target position. For a tempo session you can change the date, ratio, speed and notes. Tap Save changes and you go back to where you started (the Practice log or the tab's History); Cancel edit also takes you back, with nothing changed. Delete asks you to confirm before it removes a session, and it cannot be undone. The score timer is not shown when editing, since the session is already finished.

## Short game, Putting and Rounds

**Short game and Putting** work like Transfer training: a 30 to 60 minute session of ten-minute games, each scored on the same slider with a pass mark. A short game session always starts with a course-style game such as Par 21: three easy, three medium and three hard chips, each chipped and then putted out before you move to the next, counting every shot, with par 21 for the nine. Par 21 is scored as 30 minus your total shots, so par (21 shots) is 9 points, one under is 10, and the slider shows your shots next to the points (for example "9 of 12 points (21 shots, par)"). It counts as passed at par or better. Every putting session starts with the Essential pace ladder, a distance-control game with five lives where you step back 6 inches after each putt that stops inside its gate, and the other games are drawn at random from the rest. Speed matters more than line in these games, so most of them score where the ball stops. Sessions appear in the Practice log and in Practice trends, and can be edited or deleted like any other.

**Rounds** records a round: date, where it was, tees, holes (18 or 9), total score and par, with your score vs par worked out for you. It counts the Tiger 5 (bogeys or worse on par 5s, double bogeys or worse, 3-putts, missed greens with a 9 iron or less, and double chips), plus greens in regulation, drivers not in play, up and downs made and up and down chances. History lists every round, and Stats shows your averages (all rounds and the last five, per 18 holes) and charts of score vs par, Tiger 5 total, greens in regulation and up and down success.

The tab bar scrolls sideways now that there are nine tabs; the current tab always scrolls into view.

## Short game: area or simulator

The Short game tab has a toggle between **Short game area** and **Simulator**. The area games use real lies around a green (Par 21 and the like). The simulator games are for a hitting mat with a launch monitor or simulator such as a Foresight: every ball is hit from the same spot, so nothing changes lie and there is no putting. Distance, club and trajectory change on every ball instead, and the simulator's carry, total distance, offline, apex, spin, launch and distance-to-target numbers do the scoring. A simulator session draws three to six ten-minute games from eleven (a course-style game first, then others at random), scored on the same slider and pass marks as transfer training. Each saved session remembers where it was played: History and the Practice log mark simulator sessions, and Practice trends shows Simulator short game progress separately from the short game area. Switching the toggle with scores already entered asks you first, because it builds a new plan. Earlier sessions count as short game area sessions.

The progress ladders on the Technique tab are headed Practice Ladder Overview.

## Tiger 5 trends

The Tiger 5 tab turns your saved rounds into trends and shows where you are weakest. Choose the handicap you want to compare with (0, 5, 10, 15 or 20). The tab always opens comparing with a 5 handicap and whether to look at your last five rounds or all of them. Every number is per 18 holes, so a nine-hole round counts for half.

- **Top card:** your Tiger 5 total against a golfer at the chosen handicap, the handicap your results match, how much it moved since the five rounds before, and two stacked bars showing what your Tiger 5 is made of next to the benchmark's.
- **Work on first:** your biggest gaps in order, with roughly how many shots a round each is worth, a suggestion and a button that takes you to the tab that practises it (for example 3-putts lead to Putting and its Essential pace ladder).
- **Where you stand:** every stat on one handicap scale from 0 to 20. The dot is the handicap your results match and the highlighted mark is the one you chose, so a dot to the right of it is a weakness. The Tiger 5 are bogeys or worse on par 5s, double bogeys or worse, 3-putts, missed greens with a 9 iron or less and double chips. The other stats are greens in regulation, up and down success, drivers not in play and score vs par.
- **Over time:** your Tiger 5 total for each round, and a small chart for every stat with a dashed line at the benchmark.

**Where the benchmarks come from.** Doubles or worse, 3-putts, greens in regulation, up and down success and score are averages from large sets of tracked amateur rounds. Four stats have no published per-round figure, so they are built from the closest tracked data and are estimates:

- **Drivers not in play** (1.3, 1.8, 2.5, 3.1 and 3.7 a round at handicaps 0, 5, 10, 15 and 20). Tracked driving data gives the share of driver tee shots that end in a penalty or a recovery shot (12 percent at 0 to 4.9, about 23 percent at 10 to 15, 38 percent at 25 to 30). The figures fill in between those and assume about twelve drivers a round. This is the best grounded of the four.
- **Missed greens with a 9 iron or less** (2.0, 2.6, 3.1, 3.6 and 4.0). The miss rate comes from tracked hit rates (from 100 yards 74, 65, 57, 49 and 42 percent; with a 9 iron 60, 47, 40, 32 and about 27 percent). The number of such approaches a round is not published, so about six is assumed.
- **Bogeys or worse on par 5s** (0.8, 1.7, 2.4, 2.9 and 3.4). Modelled from the average score on par 5s at each handicap, assuming four par 5s a round.
- **Double chips** (0.2, 0.3, 0.5, 0.7 and 0.9). The only related figure is that golfers who shoot in the 90s miss the green from inside 20 yards about 10 percent of the time. Treat this one as the weakest.

The About the benchmarks section at the bottom of the tab explains each one. Different sets of tracked rounds disagree (for example scratch golfers average between about 0.5 and 1.7 three-putts a round), so use them as a guide. The shots-a-round figures in Work on first are rough, and the stats overlap, since a 3-putt can also cause a double.

## Bottom tabs

Each tab at the bottom wears the colour of its page: Technique purple, Calibration blue, Transfer orange, Short game sand, Putting green, Tempo pink, Rounds gold, Tiger 5 cyan, Practice trends teal and Practice log indigo. The tabs are sized to be easy to see and tap, five and a bit show at once, so part of the next tab always peeks in, and the bar scrolls sideways for the rest. The current tab is shown with a soft coloured pill behind its icon and a heavier label. The colours are the darker text shades in light mode and the brighter ones in dark mode, so the small labels stay readable.
