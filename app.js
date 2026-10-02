'use strict';
(function () {
  // Refuse to run inside someone else's frame (clickjacking defence).
  if (window.top !== window.self) {
    document.body.textContent = 'This page cannot be shown inside a frame.';
    return;
  }

  /* ==========================================================
     EDIT ME: drill and test libraries
     Add your own drills by copying a line inside any list.
     ========================================================== */
  // One finger width is about 3.3 yards at 100 yards, 5 at 150 and 6.6 at 200 (distance x 0.033).
  const FINGER_NOTE = 'Fingers: 1 finger is about 3.3 yards at 100 yards, 5 yards at 150 and 6.6 yards at 200. An 8-finger window is 4 fingers either side of the line. Use the calculator on this page.';
  const addFingers = (lines) => (/finger/i.test(lines.join(' ')) ? lines.concat(FINGER_NOTE) : lines);

  // G(name, setup, play, interleave rule, scoring) builds a practice game.
  // Every game must have an interleave rule: change club, target, shot or set-up from ball to ball.
  const G = (name, setup, play, interleave, score, cat) => ({
    name, cat,
    how: addFingers(['Setup: ' + setup, 'Play: ' + play, 'Interleave: ' + interleave, 'Score: ' + score]).join('\n')
  });
  const PICK = 'Use a die, a deck of cards or a random-number app to choose.';

  // GC builds a calibration game. Calibration is structured and blocked on purpose:
  // one club and one target, with a single variable stepped through a fixed order. Nothing is randomised.
  const GC = (name, setup, constant, steps, score) => ({
    name,
    how: addFingers(['Setup: ' + setup, 'Keep constant: ' + constant, 'Steps:\n' + steps.map((x, i) => (i + 1) + '. ' + x).join('\n'), 'Score: ' + score]).join('\n')
  });

  // SH marks a drill that gets its category's shared Switch block (written once, further down).
  const SH = (g) => ({ ...g, shared: true });

  const CAL = {
    'Face strike': [
      GC('Full Face Spectrum',
        'Spray or tape on one mid-iron. One target.',
        'Club, target and ball position stay the same for the whole game.',
        ['2 balls struck toward the heel on purpose.', '2 balls struck toward the toe on purpose.', '1 ball high on the face, then 1 low.', '5 balls switching between heel and toe on every ball, starting with heel.', '4 balls aiming for dead centre.'],
        'Check the mark after every ball and say what it felt like. Centre strikes in the final 4, scaled to 10.'),
      GC('Heel/Toe ladder',
        'Spray or tape on a wedge. Use a clear ruler or a pen to mark a centre line, and lines every 5 mm toward the heel and the toe, on the tape. One target.',
        'Same club and target. Only the strike position on the face changes.',
        ['One ball per rung, working across the face: 10 mm toward the heel, 5 mm, centre, 5 mm toward the toe, 10 mm.', 'Then one ball per rung back the other way.', '5 balls aiming for centre.'],
        'A rung scores 1 if the strike lands within 3 mm of where you aimed (maximum 10), plus 1 for each centre strike in the final 5. Total out of 15, scaled to 10.'),
      GC('Find your edges',
        'Spray or tape on a mid-iron. Count the grooves up from the bottom edge. One target.',
        'Same club, target and ball position.',
        ['2 balls struck low on the face, around the 2nd groove. Notice where the shot stops being useful.', '2 balls struck high on the face, around the 5th groove. Notice the same.', '3 balls switching between the low edge and the high edge, starting low.', '8 balls switching between the 2nd groove, 3rd groove and the 4th groove on every ball, starting with the 2nd.'],
        'Strikes in the final 8 on the groove you called, scaled to 10. Write down which edge you drift toward.'),
      GC('Tee height staircase',
        'Spray or tape on your driver. One club for the whole game, one tee and one target.',
        'Same club and target. Only the tee height changes, and only in this order.',
        ['2 balls on a low tee.', '2 balls on a medium tee.', '2 balls on a high tee.', '2 balls on medium, then 2 on low, then 2 on high.', '3 balls on the tee height that gave your best strikes.'],
        'Centre strikes in the final 3, scaled to 10. Write down which tee height gave your best strikes.'),
      GC('Ball position staircase',
        'Spray or tape on a mid-iron. Mark five ball positions from well back to well forward in your stance. One target.',
        'Same club and target. Only the ball position changes, in order.',
        ['3 balls with the ball well back.', '3 balls slightly back, 3 in the middle, 3 slightly forward, then 3 well forward.', 'Note which position gives your most central strikes.'],
        'Centre strikes out of 15, scaled to 10.'),
      GC('Wedge length staircase',
        'Spray or tape on a wedge. One target.',
        'Same club and target. Only the swing length changes.',
        ['3 half swings.', '3 three-quarter swings, then 3 full swings.', 'Come back down: 3 three-quarter swings, then 3 half swings.'],
        'Centre strikes out of 15, scaled to 10. Note whether strike quality changes with swing length.'),
      GC('Effort staircase',
        'Spray or tape on a mid-iron. One target.',
        'Same club and target. Only your effort level changes.',
        ['2 balls at about 50 percent effort.', '3 balls at 70 percent.', '3 balls at 85 percent.', '3 balls at 100 percent.', '4 balls moving from 50 percent, 70 percent, 85 percent and 100 percent.'],
        'Centre strikes out of 15, scaled to 10. Note the effort level where your strikes are best.'),
      GC('Strike map',
        'Spray or tape on a mid-iron. Draw a grid on paper or your phone: three columns (heel, centre, toe) by three rows (high, middle, low). One target.',
        'Everything stays the same for all 15 balls.',
        ['Hit 15 balls with your normal swing and intention.', 'After every ball, tally the strike in the grid.', 'Try and adjust your strike feel to stay in the centre of the face.', 'Look at the grid: where is the middle of your pattern, and how wide is it?'],
        'Share of strikes in the centre cell, out of 15, scaled to 10. Write down the direction your pattern leans.'),
      GC('Strike, then predict',
        'Spray or tape on a mid-iron. One target.',
        'Same club and target for the whole game.',
        ['12 balls. After impact, and before you look at the face, call the strike (toe, centre or heel, and high, middle or low).', 'Check the mark and note whether your call was right.'],
        '1 point for each centre strike and 1 point for each correct call. Maximum 24, scaled to 10.'),
      GC('High and low switch',
        'Spray or tape on a mid-iron. Count the grooves up from the bottom edge. One target.',
        'Same club, target and ball position. Only the strike height on the face changes, and it switches on every ball.',
        ['5 balls switching between high on the face (around the 5th groove) and low (around the 2nd groove), starting low.', '5 balls switching low, middle, high, middle, then repeating.', '5 balls aiming for the middle, around the 3rd to 4th groove.', 'Note how this affects your low point.'],
        'A ball scores 1 if the strike lands in the zone you called (first 10 balls), plus 1 for each strike between the 3rd and 4th groove in the final 5. Out of 15, scaled to 10.'),
      GC('Four corners switch',
        'Spray or tape on a mid-iron. Think of the face as four quarters: heel-high, toe-high, toe-low and heel-low. One target.',
        'Same club, target and ball position. Only the strike zone changes, on every ball.',
        ['Work around the face one ball per zone: heel-high, toe-high, toe-low, heel-low, then centre. Repeat the cycle 2 times (10 balls).', '5 balls aiming for centre.'],
        'Balls struck in the zone you called, out of 15, scaled to 10.')
    ],
    'Low point': [
      GC('Fat to thin spectrum',
        'A mid-iron and a line on the turf. Ball on or just ahead of the line. One target.',
        'Same club, target and ball position.',
        ['2 balls hit deliberately fat (divot well behind the ball).', '2 balls hit deliberately thin (clip the ball, almost no divot).', '4 balls switching fat, thin, fat, thin.', '1 slightly fat, then 1 slightly thin.', '5 balls with ball-first contact and the divot starting at or just ahead of the line.'],
        'Look at every divot and say where you felt the low point. Clean strikes in the final 5, scaled to 10.'),
      SH(GC('Towel gate progression',
        'An 8-iron (one club for the whole game), a towel or headcover and one target.',
        'Same club and target. Only the gap between the towel and the ball changes.',
        ['2 balls with the towel about 6 inches behind the ball.', 'Then 2 balls each at 4, 3, 2 and 1 inch, moving the towel closer each time.'],
        'Balls with clean ball-first contact and no towel contact, out of 10, scaled to 10.')),
      SH(GC('Ball position staircase',
        'A mid-iron and a line on the turf. Five ball positions from well back to well forward. One target.',
        'Same club and target. Only the ball position changes, in order.',
        ['2 balls with the ball well back.', '2 balls slightly back, 2 in the middle, 2 slightly forward, then 2 well forward.', 'Look at where each divot starts relative to the ball.'],
        'Balls with ball-first contact, out of 10, scaled to 10. Note which position gave you the cleanest contact.')),
      SH(GC('Shaft lean staircase',
        'A mid-iron and one target.',
        'Same club and target. Only the amount of shaft lean at impact changes (by feel).',
        ['3 balls with very little shaft lean.', '3 balls with a moderate amount.', '3 balls with a lot of shaft lean.', '2 balls back at the moderate amount.'],
        'Balls with ball-first contact, out of 11, scaled to 10. Note which amount gave your cleanest contact.')),
      SH(GC('Divot depth staircase',
        'A mid-iron, one target and a divot board.',
        'Same club and target. Only the depth of the divot changes.',
        ['2 balls brushing the grass with almost no divot.', '2 balls with a shallow divot, then 2 with a deeper divot.', '2 balls back at shallow, then 2 back at brushing.'],
        'Balls with ball-first contact and the divot depth you intended, out of 10, scaled to 10.')),
      SH(GC('Tempo staircase',
        'A mid-iron and one target. A metronome app is helpful.',
        'Same club and target. Only the tempo changes.',
        ['3 balls at a slow tempo.', '3 balls at your normal tempo, then 3 at a quick tempo.', '2 balls back at normal.'],
        'Balls with ball-first contact, out of 11, scaled to 10. Note which tempo gave you the cleanest contact.')),
      SH(GC('Weight staircase',
        'A mid-iron and one target. Judge your weight by feel in the lead foot.',
        'Same club and target. Only the pressure in your lead foot at impact changes.',
        ['3 balls with weight about even between your feet.', '3 balls with a bit more on the lead foot, then 3 with most of it on the lead foot.', '2 balls back at a bit more on the lead foot.'],
        'Balls with ball-first contact, out of 11, scaled to 10. Note which amount of pressure gave your cleanest contact.')),
      GC('Fat and thin switch',
        'A mid-iron and a line on the turf or a divot board. Ball on or just ahead of the line. One target.',
        'Same club, target and ball position. Only the contact changes, and it switches on every ball.',
        ['6 balls switching between deliberately fat and deliberately thin, starting with fat.', '5 balls switching fat, clean, thin, clean, then repeating.', '4 balls with ball-first contact and the divot starting at or just ahead of the line.'],
        'A ball scores 1 if the contact matches what you called (first 11 balls), plus 1 for each clean strike in the final 4. Out of 15, scaled to 10.'),
      GC('Brush and dig switch',
        'A mid-iron and one target.',
        'Same club and target. Only the depth of the divot changes, and it switches on every ball.',
        ['6 balls switching between brushing the grass with almost no divot and taking a deep divot, starting with the brush.', '5 balls switching brush, medium, deep, medium, then repeating.', '4 balls with a shallow divot and ball-first contact.'],
        'A ball scores 1 if the divot matches what you called (first 11 balls), plus 1 for each ball in the final 4 with a shallow divot and ball-first contact. Out of 15, scaled to 10.')
    ],
    'Clubface direction': [
      GC('Start line spectrum',
        'A mid-iron, one target and an alignment stick on the ground pointing at it. Film from behind if you can.',
        'Same club and target. Only your intended start line changes.',
        ['2 balls starting well left of the target on purpose.', '2 balls starting well right of the target on purpose.', '1 ball starting just left, then 1 just right.', '5 balls switching left, right, left, right, left.', '4 balls starting dead on the target.'],
        'Balls in the final 4 that start inside a 2-finger window around the target line (1 finger either side), scaled to 10.'),
      GC('Curve spectrum',
        'A mid-iron and one target.',
        'Same club and target. Only the amount and direction of curve changes.',
        ['2 big draws, then 2 big fades.', '1 small draw, then 1 small fade.', '5 balls switching draw, fade, draw, fade, draw.', '4 balls aiming to start and finish on the target line.'],
        'Balls in the final 4 finishing inside a 4-finger window around the target (2 fingers either side), scaled to 10. Note how the face felt for each shape.'),
      SH(GC('Gate narrowing',
        'Two tees set as a gate about two metres ahead of the ball, on the line to your target. A mid-iron.',
        'Same club and target. Only the gate width changes.',
        ['2 balls through a gate about 1 metre wide.', '2 balls at 80 cm, then 2 at 60 cm, 2 at 40 cm and 2 at 20 cm.'],
        'Balls through the gate, out of 10, scaled to 10.')),
      GC('Hook to slice spectrum',
        'A mid-iron, one target and plenty of room either side.',
        'Same club and target. Only the amount and direction of curve changes.',
        ['3 big hooks on purpose.', '3 big slices on purpose.', '5 balls switching hook and slice on every ball, starting with a hook.', '4 balls aiming to start and finish on the target line.'],
        'Balls in the final 4 finishing inside a 4-finger window around the target (2 fingers either side), scaled to 10. Notice how much you had to change to go from one extreme to the other.'),
      SH(GC('Face feel ladder',
        'A mid-iron, one target and an alignment stick. Film if you can.',
        'Same club and target. Only the face you intend to present at impact changes (by feel).',
        ['2 balls with a very closed face feel, 2 with a slightly closed feel.', '1 ball with a neutral feel.', '2 balls with a slightly open feel, 2 with a very open feel.', '2 balls back at neutral, aiming at the target.'],
        'Balls that started the way you intended (closed starts the ball left of the line, open starts it right, for a right-handed golfer). Out of 11, scaled to 10.')),
      SH(GC('Landing window shrink',
        'A mid-iron and one target. Markers to set the width of a landing window in fingers.',
        'Same club and target. Only the width of the landing window changes.',
        ['2 balls into a window 8 fingers wide (4 either side of the target).', '2 balls at 6 fingers, then 2 at 4 fingers, 2 at 3 fingers and 2 at 2 fingers.'],
        'Balls landing inside the window, out of 10, scaled to 10.')),
      SH(GC('Bias check and correct',
        'A mid-iron and one target. A notepad or phone to tally.',
        'Same club and target.',
        ['6 balls at the target with your normal intention. Tally each as starting left, centre or right.', 'Work out your bias: the side where most balls start.', '5 more balls with a small intended correction against your bias.'],
        'Balls starting inside a 2-finger window around the line in the 5 correction balls, scaled to 10. Compare with the first 6 and note what the correction felt like.')),
      SH(GC('Face call before you look',
        'A mid-iron and one target.',
        'Same club and target for the whole game.',
        ['10 balls. After impact, and before the ball lands, call where it will finish: left of, on or right of the target.', 'Then watch the result and note whether your call was right.'],
        'Correct calls out of 10, scaled to 10. Calibration is about knowing what the face did, not just hitting the target.')),
      GC('Left and right switch',
        'A mid-iron, one target and an alignment stick. Film if you can.',
        'Same club and target. Only the start line changes, left or right of the same target, and it switches on every ball.',
        ['6 balls switching between starting the ball left of the target and right of it, about 2 fingers off the line each way, starting left.', '5 balls switching left, target, right, target, then repeating.', '4 balls starting on the target.'],
        'A ball scores 1 if it starts where you called (first 11 balls), plus 1 for each on-target ball in the final 4. Out of 15, scaled to 10.'),
      GC('Draw and fade switch',
        'A mid-iron and one target. Both shapes start from the target line: the draw curves left and the fade curves right.',
        'Same club and target. Only the shape changes, and it switches on every ball.',
        ['6 balls switching between a draw and a fade, starting with a draw.', '5 balls switching draw, straight, fade, straight, then repeating.', '4 balls aiming to start and finish on the target line.'],
        'A ball scores 1 if it shows the shape you called (first 11 balls), plus 1 for each ball in the final 4 finishing inside a 4-finger window. Out of 15, scaled to 10.'),
      GC('Shape and start line grid',
        'A mid-iron and one target. A notepad for a grid of three start lines (left, on target, right) by three shapes (draw, straight, fade).',
        'Same club and target. Only the start line and the shape change.',
        ['Work through the nine combinations in this order, one ball each: left-draw, left-straight, left-fade, target-draw, target-straight, target-fade, right-draw, right-straight, right-fade.', 'Repeat the first six combinations once more (15 balls in total).', 'Mark the combinations you found easiest and hardest.'],
        'Balls that matched both the start line and the shape, out of 15, scaled to 10.'),
      GC('Shape and line on call',
        'A mid-iron, one target and a die or random-number app. First roll picks the start line (1 or 2 = left, 3 or 4 = on target, 5 or 6 = right). Second roll picks the shape (1 or 2 = draw, 3 or 4 = straight, 5 or 6 = fade).',
        'Same club and target. Only the start line and the shape change, and they are called before every ball.',
        ['15 balls. Before each ball, roll for the start line and the shape, then play that combination.', 'If the combination matches the previous ball, roll again so it always switches.'],
        '2 points if both the start line and the shape are right, 1 if one is right, 0 if neither. Maximum 30, scaled to 10.')
    ]
  };

  // Switch blocks: club and target never change in calibration. Drills tagged shared get their category's
  // 4-ball block after their steps; its score is averaged with the drill's own score.
  const SWITCH = {
    'Face strike': {
      play: '4 balls switching where you strike the face on every ball, never the same spot twice in a row. Call the spot before you hit, for example heel, toe, high, low. Same club and target. Keep this block even if you have to shorten the earlier ones.',
      score: 'Switch balls struck where you called, out of 4, scaled to 10. Your game score is the average of that and the score above.'
    },
    'Low point': {
      play: '4 balls switching your contact on every ball in a pattern you call first, for example fat, clean, thin, clean. Same club and target. Keep this block even if you have to shorten the earlier ones.',
      score: 'Switch balls that matched your call, out of 4, scaled to 10. Your game score is the average of that and the score above.'
    },
    'Clubface direction': {
      play: '4 balls switching shot shape and start line on every ball, changing both from the ball before. For example: right start with a draw, left start with a fade, on target and straight, left start with a draw. Same club and target. Keep this block even if you have to shorten the earlier ones.',
      score: 'Switch balls where both the start line and the shape matched your call, out of 4, scaled to 10. Your game score is the average of that and the score above.'
    }
  };
  for (const cat of Object.keys(CAL)) {
    CAL[cat] = CAL[cat].map((g) => {
      if (!g.shared) return { name: g.name, how: g.how };
      const parts = g.how.split('\nScore: ');
      const scoreLine = parts.slice(1).join('\nScore: ').split('\nFingers: ');
      const fingers = scoreLine.length > 1 ? '\nFingers: ' + scoreLine.slice(1).join('\nFingers: ') : '';
      return { name: g.name, how: parts[0] + '\nSwitch: ' + SWITCH[cat].play + '\nScore: ' + scoreLine[0] + ' ' + SWITCH[cat].score + fingers };
    });
  }

  const TRANSFER_BASE = [
    G('Range round, six holes',
      'Write six holes on a card. For each, pick a tee shot (driver or 3-wood to a 4-finger landing window between two range markers) and an approach (a flag distance and a club, with a 3-finger window around the flag). Use a different flag and club on every hole.',
      '12 balls: tee shot, then approach, for each hole. One ball per shot, no re-hits, full routine every ball. Play the holes in a random order you draw.',
      'Random hole order, and a different club and target on each shot, as on a real course.',
      'Shots finishing inside the window or on the flag, out of 12, scaled to 10. Mark it passed if you score 7 or higher.',
      'Course simulation'),
    G('Protect your points',
      'Choose four targets at different distances and four clubs. Use a 4-finger window for every target. Start with 10 points.',
      '10 balls. Before every ball, draw the target and the club. Each ball that misses the window costs 1 point. Full routine every ball, no re-hits.',
      'Target and club both change on every ball, never the same club twice in a row.',
      'Points left at the end. Mark it passed if you finish with 6 or more.',
      'Pressure game'),
    G('Three targets, random order',
      'Choose three targets, each with a 4-finger window, and three clubs. Write down a random order for hitting the targets, and change the order every round.',
      'Hit each target once, in the random order, with a different club each time. Missing any window means you start the round again. Maximum 15 balls.',
      'Target order is reshuffled after every round, and the club for each target changes each round.',
      '10 for a clean first round, minus 2 for each restart. 0 if you do not finish in 15 balls. Mark it passed if you finish.',
      'Pressure game'),
    G('Routine under pressure',
      'Four targets with 4-finger windows, four clubs and a phone timer. Decide your pre-shot routine and its length.',
      '8 balls with your full routine every ball. A ball hit without the full routine counts as a miss, and so does a ball that takes longer than 45 seconds from start of routine to contact.',
      'Random target, club and shape on every ball, drawn before the routine starts.',
      'Balls that finish inside the window out of 8, scaled to 10. Mark it passed if you score 7 or higher.',
      'Pressure game'),
    G('Range Stableford',
      'Choose three targets. Each has an outer window 4 fingers wide and an inner window 2 fingers wide.',
      '12 balls. Before every ball, draw the target and a club. Score 2 for inside the inner window, 1 for inside the outer window and 0 for a miss.',
      'Target and club change on every ball, never the same club twice in a row.',
      'Total points out of 24, scaled to 10. Mark it passed if you reach 12 points or more.',
      'Scoring game'),
    G('Clock pressure',
      'A phone timer set to 40 seconds per ball, three targets with 4-finger windows and three clubs.',
      '10 balls. Draw the target and the club, start the timer, and finish your routine and hit within the 40 seconds. A ball hit after the timer counts as a miss.',
      'Draw a new target and club for every ball, before the timer starts.',
      'Balls inside the window out of 10. Mark it passed if you score 6 or higher.',
      'Pressure game'),
    G('Beat your number',
      'Choose your own target set (each with a 4-finger window) and clubs. Look at your last result for this game and write down the number you need to beat.',
      '10 balls. Draw the target and the club for each ball, then play it with full routine and no re-hits. Count balls inside the window.',
      'Target and club change on every ball. Write the sequence down first so you cannot choose easy targets.',
      'Balls inside the window out of 10. Mark it passed only if you beat your previous number.',
      'Scoring game'),
    G('Tee shot and approach pairs',
      'A 4-finger landing window for driver or 3-wood, and a flag with a 3-finger window for approach shots. Five pairs.',
      '10 balls: five tee shots alternating with five approach shots, as one hole after another. Draw the approach club and distance for each pair. No re-hits.',
      'Alternate long and short clubs, with a new approach club, flag and shape each pair.',
      'Balls inside their window out of 10. Mark it passed if you score 7 or higher.',
      'Course simulation'),
    G('Infinity levels',
      'One driver, one mid-iron and one wedge, each with its own target on the range and an 8-finger window. Levels: level 1 is one shot with each club. Each new level adds one shot, in this order: another wedge, another iron, another driver, and so on.',
      'Hit the level in rotation (driver, iron, wedge, then repeat). You pass a level when every shot lands inside its window with no mistakes. You get three attempts at each level; if you fail all three, drop back a level. Play until your 10 minutes are up. Next time, start from the level you reached.',
      'Rotate between the clubs and never hit the same shot twice in a row.',
      'Levels passed in 10 minutes, doubled (maximum 10). Mark it passed if you pass level 3 or higher.',
      'Scoring game'),
    G('Perfection ladder',
      'A full set of clubs from wedge to driver, one target and an 8-finger window. Windows to move to later: 6 fingers, then 4 fingers.',
      'Start with your wedge. If the ball lands inside the window, move up one club for the next ball; if it misses, move down one club. Keep going through the set. When you reach the driver, repeat with a narrower window. Play until your 10 minutes are up.',
      'The club changes after every ball by design, because you always move up or down the set.',
      'Balls inside the window out of your first 12, scaled to 10. Mark it passed if you reach your 7-iron or a longer club.',
      'Scoring game'),
    G('Two-ball test',
      'Two clubs and a target with an 8-finger window. Windows to move to: 6, 4, 3 and 2 fingers.',
      'Hit two balls at the window, each with a different club. Two out of two: shrink the window one step. One out of two: stay the same. None: widen the window one step. Play until your 10 minutes are up.',
      'Use a different club for each of the two balls, and swap the two clubs for different ones every few rounds.',
      'Narrowest window reached: 8 fingers = 4, 6 = 6, 4 = 8, 3 = 9, 2 = 10 (0 if you ended wider than 8). Mark it passed at 6 fingers or narrower.',
      'Pressure game'),
    G('Gambler',
      'Four clubs, three targets and a notepad. Window widths you can choose are 2 to 10 fingers.',
      '10 balls. Before every ball, draw the club and the target, then choose your window width before you hit. Landing inside the window scores points equal to its width in fingers. A miss adds 10 points. The lowest total wins.',
      'The club and target are drawn fresh for every ball, so you cannot settle on a favourite shot.',
      'Your total over 10 balls: 25 or less = 10, 40 = 7, 60 = 4, 80 or more = 0. Mark it passed at 40 or less.',
      'Pressure game'),
    G('Worst shot',
      'A target, three clubs and a notepad. Measure misses in fingers from the target line.',
      'Hit three balls at the target, each with a different club. Find the worst of the three and count how many fingers it finished from the target. Repeat for three rounds and add up the three worst shots.',
      'A different club for each of the three balls, and a new target for each round.',
      'Total fingers for your three worst shots: 3 or less = 10, 6 = 7, 9 = 4, 12 or more = 0. Mark it passed at 6 or less.',
      'Scoring game'),
    G('Danger side',
      'Work out which side you miss more often. Pick a flag, and set a 4-finger window on the safe side of it. The danger side is the other side of the flag. Scoring: 1 point inside the window, 0 points on the safe side outside it, minus 3 points on the danger side.',
      '10 balls, tallying points as you go. Full routine every ball, no re-hits.',
      'Draw a new club for every ball and change the flag after five balls.',
      'Points after 10 balls (maximum 10). Mark it passed at 5 points or more.',
      'Pressure game'),
    G('Wide or narrow',
      'Two targets set with range markers: one wide (4 fingers) and one narrow (2 fingers), for example range poles or two pairs of yardage markers. A scorecard for six par 4 holes.',
      'Each hole: hit your driver at the wide target. If you hit it, play your 7-iron at the wide target; if you miss, play your 7-iron at the narrow target. Hole score: drive hit and approach hit = 3. Drive hit and approach missed = 4. Drive missed and approach hit = 4. Both missed = 5.',
      'Driver and 7-iron alternate every shot, the targets change with the result of the drive, and you move to a new pair of markers every two holes.',
      '10 for 18 strokes or fewer over six holes, minus 1 for each stroke over. Mark it passed at 24 or fewer.',
      'Course simulation'),
    G('Weakest link, mixed',
      'Two targets and four clubs. An 8-finger window. Windows to move to: 6, 4, 3 and 2 fingers.',
      'Count how many balls in a row land inside the window. Alternate between the two targets and change the club on every ball. A miss takes your count back to zero. When you reach five in a row, shrink the window one step. Play until your 10 minutes are up.',
      'Targets alternate and the club changes on every ball. This is a mixed version of a game normally played at one target.',
      'Narrowest window completed: 8 fingers = 4, 6 = 6, 4 = 8, 3 = 9, 2 = 10 (0 if none). Mark it passed at 6 fingers or narrower.',
      'Pressure game')
  ];

  // Focus line added to every transfer game. Both coaches favour an external focus under pressure.
  const FOCUS = 'Focus: use your full routine on every ball and keep your attention on the target and the ball flight, not on body positions.';
  const ANCHOR = 'New move under pressure';
  TRANSFER_BASE.push(G(ANCHOR,
    'Use the mechanic from your latest technique protocol. Three targets with 4-finger windows, three clubs and, if you can, your phone to film.',
    '12 balls. Before each ball, draw the target and the club. Take one smoothie rehearsal swing with the new move beside the ball, step in, then hit with your attention on the target. Film as many as you can.',
    'Target and club change on every ball, never the same club twice in a row.',
    'Balls where the new move showed up and the ball finished inside a 4-finger window, out of 12, scaled to 10. Mark it passed if you score 6 or higher.',
    'Pattern transfer'));
  const TRANSFER = TRANSFER_BASE.map((g) => ({ name: g.name, cat: g.cat, how: g.how + '\n' + FOCUS }));

  /* Technique protocol: no club -> freezer -> smoothie -> foam ball -> real ball.
     Progression from Dr Luke Benoit's 5x5 method. The Set the target and Refine blocks follow
     Adam Young's Diagnose, Intervene, Refine, Transfer structure. */
  const STAGE_NAMES = ['No club', 'Freezer', 'Smoothie', 'Foam ball', 'Real ball'];
  const STAGE_SHORT = ['No club', 'Freezer', 'Smoothie', 'Foam', 'Real'];
  const FIVE = 'Five good swings in a row, hitting the position you set. If one is wrong, start the set of five again and add 1 to your sets attempted.';
  const STAGES = [
    { name: 'No club', how: 'Hold the club across your shoulders (or hold no club) and rehearse the move into the position you set.\n' + FIVE },
    { name: 'Freezer swings', how: 'Take the club slowly to the position (about four seconds), hold it for a second, then swing through at full speed. Check the position on video or in a mirror.\n' + FIVE },
    { name: 'Smoothie swings', how: 'The same as the freezer but drop the pause: slow motion to the position, then full speed through in one flowing swing.\n' + FIVE },
    { name: 'Foam ball', how: 'Add a foam ball and use the same method. You can alternate freezer and smoothie swings. The foam ball lets you change the pattern while hitting a ball, without chasing the reward of a pure real shot.\n' + FIVE },
    { name: 'Real ball', how: 'Now hit real balls. You can think about the move as you swing. Your job is to get comfortable hitting real shots with the new pattern, and some of them will be bad: that is often a sign the pattern is changing. If a big miss shows up again and again, spend a few balls hitting it the other way on purpose to nudge impact back to a workable window, without losing the move.\n' + FIVE }
  ];
  const SET_BLOCK = { name: 'Set the target', how: 'Diagnose first. Write down the mechanic and the exact position you want, film one baseline swing and compare it with that position. Pick a check you can judge on video or in a mirror. If the mechanic has several parts, work the pivot and transition first, then the arms and club. The goal of this session is to change your pattern, not to hit good shots, because trying to hit good shots at the same time splits your attention.' };
  const REFINE_BLOCK = { name: 'Refine on real balls', how: 'Keep the move and calibrate it. Hit 3 real balls with a little too much of the move, 3 with a little too little, then 3 with the amount you want. Finish with shots at a target, keeping your attention on the ball flight.' };

  // Minutes for each block, by starting stage (all total 30). Stage -1 is Set the target, 5 is Refine.
  const PROTO_PLANS = {
    0: [[-1, 3], [0, 3], [1, 6], [2, 6], [3, 6], [4, 6]],
    1: [[-1, 3], [1, 6], [2, 6], [3, 7], [4, 8]],
    2: [[-1, 3], [2, 7], [3, 9], [4, 11]],
    3: [[-1, 3], [3, 10], [4, 17]],
    4: [[-1, 3], [4, 12], [5, 15]]
  };

  const CAL_BLOCK_MINUTES = 10;      // 3 games x 10 min = 30 min
  const TRANSFER_BLOCK_MINUTES = 10; // 3 games x 10 min = 30 min

  /* ==========================================================
     Constants and small helpers
     ========================================================== */
  const VAULT_KEY = 'golfpractice.vault.v1';
  const LOCK_KEY = 'golfpractice.attempts.v1';
  const BACKUP_KEY = 'golfpractice.lastbackup.v1';
  const BACKUP_REMIND_MS = 7 * 24 * 60 * 60 * 1000;
  const PBKDF2_ITER = 600000;
  const IDLE_MS = 10 * 60 * 1000;
  const MAX_ITEMS = 3000;

  const root = document.getElementById('root');
  const te = new TextEncoder();
  const td = new TextDecoder();

  const today = () => {
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  };
  const isDate = (v) => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v);
  const str = (v, max) => (typeof v === 'string' ? v.slice(0, max) : '');
  const num = (v, min, max) => {
    v = Number(v);
    if (!Number.isFinite(v)) return min;
    return Math.min(max, Math.max(min, v));
  };
  const arr = (v) => (Array.isArray(v) ? v.slice(0, MAX_ITEMS).filter((x) => x && typeof x === 'object') : []);
  const uid = () => {
    const b = crypto.getRandomValues(new Uint8Array(12));
    return Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('');
  };
  const shuffle = (a) => {
    const r = a.slice();
    for (let i = r.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [r[i], r[j]] = [r[j], r[i]];
    }
    return r;
  };
  const avgArr = (a) => a.reduce((x, y) => x + y, 0) / a.length;
  const byDateDesc = (a, b) => b.date.localeCompare(a.date);
  const fmtDate = (iso) => new Date(iso + 'T12:00:00').toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  const shortDate = (iso) => new Date(iso + 'T12:00:00').toLocaleDateString(undefined, { day: 'numeric', month: 'short' });

  // DOM builder. User text only ever goes in via textContent / text nodes, never innerHTML.
  function h(tag, attrs, ...kids) {
    const el = document.createElement(tag);
    let value;
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v === false || v == null) continue;
      if (k === 'class') el.className = v;
      else if (k === 'text') el.textContent = v;
      else if (k === 'value') value = v;
      else if (k.slice(0, 2) === 'on' && typeof v === 'function') el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? '' : String(v));
    }
    for (const kid of kids.flat(Infinity)) {
      if (kid == null || kid === false) continue;
      el.append(kid instanceof Node ? kid : String(kid));
    }
    if (value !== undefined) el.value = value;
    return el;
  }
  const SVG_NS = 'http://www.w3.org/2000/svg';
  function s(tag, attrs, ...kids) {
    const el = document.createElementNS(SVG_NS, tag);
    for (const [k, v] of Object.entries(attrs || {})) el.setAttribute(k, String(v));
    for (const kid of kids) if (kid != null) el.append(kid instanceof Node ? kid : String(kid));
    return el;
  }

  function toast(msg) {
    const old = document.querySelector('.toast');
    if (old) old.remove();
    const el = h('div', { class: 'toast', role: 'status', text: msg });
    document.body.append(el);
    setTimeout(() => el.remove(), 2600);
  }

  /* ==========================================================
     Crypto: PBKDF2 -> AES-GCM. The passphrase is never stored.
     Being able to decrypt the vault is the login check.
     ========================================================== */
  function toB64(buf) {
    const b = new Uint8Array(buf);
    let out = '';
    for (let i = 0; i < b.length; i += 0x8000) out += String.fromCharCode.apply(null, b.subarray(i, i + 0x8000));
    return btoa(out);
  }
  function fromB64(t) {
    const bin = atob(t);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }
  async function deriveKey(pass, salt, iter) {
    const base = await crypto.subtle.importKey('raw', te.encode(pass), 'PBKDF2', false, ['deriveKey']);
    return crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt, iterations: iter, hash: 'SHA-256' },
      base,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }
  async function encryptData(key, obj) {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, te.encode(JSON.stringify(obj)));
    return { iv: toB64(iv), ct: toB64(ct) };
  }
  async function decryptData(key, iv, ct) {
    const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: fromB64(iv) }, key, fromB64(ct));
    return JSON.parse(td.decode(pt));
  }
  const corrupt = () => Object.assign(new Error('corrupt'), { corrupt: true });
  function parseVault(raw) {
    let v;
    try { v = JSON.parse(raw); } catch (e) { throw corrupt(); }
    if (!v || v.v !== 1 || !Number.isInteger(v.iter) || v.iter < 100000 || v.iter > 5000000 ||
        typeof v.salt !== 'string' || typeof v.iv !== 'string' || typeof v.ct !== 'string' ||
        v.salt.length > 64 || v.iv.length > 32) throw corrupt();
    return v;
  }

  /* ==========================================================
     Data model and validation
     ========================================================== */
  const emptyData = () => ({ technique: [], protocols: [], calibration: [], transfer: [] });

  const cleanItem = (i) => ({
    id: str(i.id, 64) || uid(),
    cat: str(i.cat, 40),
    name: str(i.name, 120),
    how: str(i.how, 1500),
    minutes: num(i.minutes, 0, 120),
    score: i.score == null ? null : Math.round(num(i.score, 0, 10)),
    passed: i.passed === true,
    notes: str(i.notes, 3000),
    stage: Math.round(num(i.stage, -1, 5)),
    rounds: Math.round(num(i.rounds, 0, 99))
  });

  function cleanData(d) {
    const out = emptyData();
    if (!d || typeof d !== 'object') return out;
    for (const t of arr(d.technique)) {
      out.technique.push({
        id: str(t.id, 64) || uid(),
        date: isDate(t.date) ? t.date : today(),
        mechanics: str(t.mechanics, 200),
        notes: str(t.notes, 3000),
        improve: str(t.improve, 3000)
      });
    }
    for (const p of arr(d.protocols)) {
      out.protocols.push({
        id: str(p.id, 64) || uid(),
        date: isDate(p.date) ? p.date : today(),
        mechanic: str(p.mechanic, 200),
        target: str(p.target, 500),
        items: arr(p.items).slice(0, 12).map(cleanItem),
        notes: str(p.notes, 3000),
        next: str(p.next, 3000)
      });
    }
    for (const kind of ['calibration', 'transfer']) {
      for (const rec of arr(d[kind])) {
        out[kind].push({
          id: str(rec.id, 64) || uid(),
          date: isDate(rec.date) ? rec.date : today(),
          items: arr(rec.items).slice(0, 20).map(cleanItem)
        });
      }
    }
    return out;
  }

  /* ==========================================================
     Session state (lives in memory only while unlocked)
     ========================================================== */
  let session = null; // { key, salt, iter, data }
  const freshUi = () => ({ tab: 'technique', mode: 'new', len: { technique: 30, calibration: 30, transfer: 30 } });
  let ui = freshUi();
  let drafts = freshDrafts();
  let tickHandle = null;
  let idleHandle = null;
  let writeChain = Promise.resolve();

  function freshDrafts() {
    return { technique: { id: null, date: today(), mechanics: '', notes: '', improve: '' }, protocol: freshProtocol(), calibration: null, transfer: null };
  }
  function clearTimer() {
    if (tickHandle) clearInterval(tickHandle);
    tickHandle = null;
  }

  function persist() {
    writeChain = writeChain.catch(() => {}).then(async () => {
      if (!session) return;
      const { iv, ct } = await encryptData(session.key, session.data);
      localStorage.setItem(VAULT_KEY, JSON.stringify({ v: 1, iter: session.iter, salt: toB64(session.salt), iv, ct }));
    });
    return writeChain;
  }

  async function unlock(pass) {
    const v = parseVault(localStorage.getItem(VAULT_KEY));
    const salt = fromB64(v.salt);
    const key = await deriveKey(pass, salt, v.iter);
    const data = await decryptData(key, v.iv, v.ct); // throws on a wrong passphrase
    session = { key, salt, iter: v.iter, data: cleanData(data) };
  }

  function lock() {
    clearTimeout(idleHandle);
    clearTimer();
    session = null;
    drafts = freshDrafts();
    ui = freshUi();
    renderLock();
  }

  function bump() {
    clearTimeout(idleHandle);
    if (!session) return;
    idleHandle = setTimeout(() => {
      if (tickHandle) { bump(); return; } // a practice timer is running, stay unlocked
      lock();
    }, IDLE_MS);
  }
  ['pointerdown', 'keydown', 'scroll', 'touchstart'].forEach((e) => window.addEventListener(e, bump, { passive: true, capture: true }));

  // Failed-attempt delay. Offline guessing is limited mainly by the PBKDF2 cost.
  function getAttempts() {
    try {
      const a = JSON.parse(localStorage.getItem(LOCK_KEY));
      return { n: num(a.n, 0, 1000), until: num(a.until, 0, 8.64e15) };
    } catch (e) { return { n: 0, until: 0 }; }
  }
  function registerFailure() {
    const a = getAttempts();
    a.n += 1;
    if (a.n >= 3) a.until = Date.now() + Math.min(15 * 60 * 1000, Math.pow(2, a.n - 3) * 5000);
    localStorage.setItem(LOCK_KEY, JSON.stringify(a));
  }
  const resetAttempts = () => localStorage.removeItem(LOCK_KEY);

  // Ask the browser not to evict this site's storage when space is low or history is cleared automatically.
  let persistAsked = false;
  function requestPersist() {
    if (persistAsked) return;
    persistAsked = true;
    try {
      if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
    } catch (e) { /* best effort */ }
  }
  const markBackup = () => { try { localStorage.setItem(BACKUP_KEY, String(Date.now())); } catch (e) { /* ignore */ } };
  function backupDue() {
    if (!session) return false;
    const total = session.data.technique.length + session.data.protocols.length + session.data.calibration.length + session.data.transfer.length;
    if (!total) return false;
    const last = Number(localStorage.getItem(BACKUP_KEY));
    return !Number.isFinite(last) || !last || Date.now() - last > BACKUP_REMIND_MS;
  }

  function eraseAll() {
    const typed = window.prompt('This permanently deletes your practice log from this device. Type ERASE to continue.');
    if (typed !== 'ERASE') return;
    localStorage.removeItem(VAULT_KEY);
    localStorage.removeItem(LOCK_KEY);
    localStorage.removeItem(BACKUP_KEY);
    session = null;
    renderLock();
  }

  /* ==========================================================
     Lock screen: create passphrase / unlock
     ========================================================== */
  function renderLock() {
    clearTimer();
    root.replaceChildren(localStorage.getItem(VAULT_KEY) ? loginView() : setupView());
    const first = root.querySelector('input');
    if (first) first.focus();
  }

  function setupView() {
    const p1 = h('input', { type: 'password', autocomplete: 'new-password', required: true, minlength: 12, autocapitalize: 'off', spellcheck: 'false' });
    const p2 = h('input', { type: 'password', autocomplete: 'new-password', required: true, autocapitalize: 'off', spellcheck: 'false' });
    const msg = h('p', { class: 'msg', role: 'alert' });
    const btn = h('button', { type: 'submit', class: 'primary', text: 'Create log' });
    const form = h('form', {
      class: 'lock-form',
      onsubmit: async (e) => {
        e.preventDefault();
        if (p1.value.length < 12) { msg.textContent = 'Use at least 12 characters. Four random words works well.'; return; }
        if (p1.value !== p2.value) { msg.textContent = 'The two passphrases do not match.'; return; }
        btn.disabled = true;
        msg.textContent = 'Setting up encryption...';
        try {
          const salt = crypto.getRandomValues(new Uint8Array(16));
          const key = await deriveKey(p1.value, salt, PBKDF2_ITER);
          session = { key, salt, iter: PBKDF2_ITER, data: emptyData() };
          await persist();
          p1.value = ''; p2.value = '';
          renderApp(true);
          bump();
        } catch (err) {
          session = null;
          btn.disabled = false;
          msg.textContent = 'Could not set up encryption in this browser. Use a current browser over https.';
        }
      }
    },
      h('label', { class: 'field' }, h('span', { class: 'lbl', text: 'Passphrase' }), p1),
      h('label', { class: 'field' }, h('span', { class: 'lbl', text: 'Repeat passphrase' }), p2),
      msg, btn);
    return h('div', { class: 'lock' },
      h('h1', { text: 'Golf practice log' }),
      h('p', { text: 'Create a passphrase. Your log is encrypted on this device with it and nothing is uploaded. If you forget the passphrase, the data cannot be recovered.' }),
      form);
  }

  function loginView() {
    const pass = h('input', { type: 'password', autocomplete: 'current-password', required: true, autocapitalize: 'off', spellcheck: 'false' });
    const msg = h('p', { class: 'msg', role: 'alert' });
    const btn = h('button', { type: 'submit', class: 'primary', text: 'Unlock' });
    let countdown = null;

    function refresh() {
      const wait = Math.ceil((getAttempts().until - Date.now()) / 1000);
      if (wait > 0) {
        btn.disabled = true;
        msg.textContent = 'Too many attempts. Try again in ' + wait + 's.';
        if (!countdown) countdown = setInterval(refresh, 1000);
      } else {
        btn.disabled = false;
        if (countdown) { clearInterval(countdown); countdown = null; msg.textContent = ''; }
      }
    }

    const form = h('form', {
      class: 'lock-form',
      onsubmit: async (e) => {
        e.preventDefault();
        if (getAttempts().until > Date.now()) return;
        btn.disabled = true;
        msg.textContent = 'Unlocking...';
        try {
          await unlock(pass.value);
          pass.value = '';
          resetAttempts();
          if (countdown) clearInterval(countdown);
          renderApp(true);
          bump();
        } catch (err) {
          pass.value = '';
          if (err && err.corrupt) {
            msg.textContent = 'The stored data is damaged. Erase it below and restore a backup.';
            btn.disabled = false;
          } else {
            registerFailure();
            msg.textContent = 'That passphrase did not work.';
            btn.disabled = false;
            refresh();
          }
        }
      }
    },
      h('label', { class: 'field' }, h('span', { class: 'lbl', text: 'Passphrase' }), pass),
      msg, btn,
      h('button', { type: 'button', class: 'link', text: 'Forgot the passphrase? Erase everything', onclick: eraseAll }));

    const view = h('div', { class: 'lock' },
      h('h1', { text: 'Golf practice log' }),
      h('p', { text: 'Enter your passphrase to open your log.' }),
      form);
    setTimeout(refresh, 0);
    return view;
  }

  /* ==========================================================
     App shell
     ========================================================== */
  const TABS = [['technique', 'Technique'], ['calibration', 'Calibration'], ['transfer', 'Transfer'], ['tracking', 'Tracking']];

  function renderApp(toTop) {
    clearTimer();
    requestPersist();
    let view;
    if (ui.tab === 'settings') view = settingsView();
    else if (ui.tab === 'technique') view = techniqueView();
    else if (ui.tab === 'tracking') view = trackingView();
    else view = sessionsView(ui.tab);

    const header = h('header', { class: 'top' },
      h('h1', { text: 'Golf practice log' }),
      h('div', { class: 'top-actions' },
        h('button', { type: 'button', class: 'ghost', text: 'Settings', onclick: () => { ui.tab = 'settings'; renderApp(true); } }),
        h('button', { type: 'button', class: 'ghost', text: 'Lock', onclick: lock })));
    const nav = h('nav', { class: 'tabs', 'aria-label': 'Sections' },
      TABS.map(([id, label]) => h('button', {
        type: 'button', class: 'tab', text: label,
        'aria-current': ui.tab === id ? 'page' : false,
        onclick: () => { ui.tab = id; renderApp(true); }
      })));
    const reminder = backupDue() ? h('div', { class: 'stack' },
      h('p', { class: 'banner', text: 'Your log lives only on this device. Back it up so clearing Safari history cannot erase it.' }),
      h('div', { class: 'actions' },
        h('button', { type: 'button', class: 'primary', text: 'Back up now', onclick: async () => { if (await exportBackup()) { toast('Backup saved'); renderApp(); } } }))) : null;
    root.replaceChildren(header, h('main', null, reminder, view), nav);
    if (toTop) window.scrollTo(0, 0);
  }

  function modeBar(modes) {
    const list = Array.isArray(modes) ? modes : [['new', modes], ['history', 'History']];
    return h('div', { class: 'seg-ctl', role: 'group', 'aria-label': 'View' },
      list.map(([m, l]) => h('button', {
        type: 'button', class: 'seg-btn', text: l,
        'aria-pressed': String(ui.mode === m),
        onclick: () => { ui.mode = m; renderApp(true); }
      })));
  }

  function field(label, control, hint) {
    return h('label', { class: 'field' }, h('span', { class: 'lbl', text: label }), hint ? h('span', { class: 'hint', text: hint }) : null, control);
  }
  function dateInput(obj) {
    const el = h('input', { type: 'date', required: true, value: obj.date });
    el.addEventListener('input', () => { obj.date = el.value; });
    return el;
  }
  function textInput(obj, key, max, ph) {
    const el = h('input', { type: 'text', maxlength: max, placeholder: ph || false, value: obj[key] });
    el.addEventListener('input', () => { obj[key] = el.value; });
    return el;
  }
  function textArea(obj, key, rows, max) {
    const el = h('textarea', { rows, maxlength: max, value: obj[key] });
    el.addEventListener('input', () => { obj[key] = el.value; });
    return el;
  }
  function upsert(list, rec) {
    const i = list.findIndex((x) => x.id === rec.id);
    if (i >= 0) list[i] = rec; else list.push(rec);
  }
  function entryShell(summary, body, onEdit, onDelete) {
    return h('details', { class: 'entry' },
      h('summary', null, summary),
      h('div', { class: 'entry-body' }, body,
        h('div', { class: 'actions' },
          h('button', { type: 'button', class: 'ghost', text: 'Edit', onclick: onEdit }),
          h('button', { type: 'button', class: 'danger', text: 'Delete', onclick: onDelete }))));
  }
  async function removeRecord(kind, id) {
    if (!window.confirm('Delete this entry? This cannot be undone.')) return;
    session.data[kind] = session.data[kind].filter((x) => x.id !== id);
    await persist();
    renderApp();
    toast('Deleted');
  }

  /* ==========================================================
     Section 1: technique practice (30-minute protocol, quick log, history)
     ========================================================== */
  const mechKey = (m) => m.trim().toLowerCase();

  function progressByMechanic() {
    const map = new Map();
    for (const p of session.data.protocols) {
      const k = mechKey(p.mechanic);
      if (!k) continue;
      let e = map.get(k);
      if (!e) { e = { name: p.mechanic.trim(), furthest: -1, last: p.date, sessions: 0 }; map.set(k, e); }
      e.sessions += 1;
      if (p.date >= e.last) { e.last = p.date; e.name = p.mechanic.trim(); }
      for (const it of p.items) if (it.stage >= 0 && it.stage <= 4 && it.passed) e.furthest = Math.max(e.furthest, it.stage);
    }
    return [...map.values()].sort((a, b) => b.last.localeCompare(a.last));
  }
  function suggestedStart(mech) {
    const e = progressByMechanic().find((x) => mechKey(x.name) === mechKey(mech));
    return !e || e.furthest < 0 ? 0 : Math.min(4, e.furthest + 1);
  }
  function freshProtocol() {
    return { id: null, date: today(), mechanic: '', target: '', start: 0, startTouched: false, items: [], notes: '', next: '', timer: { base: 0, startedAt: null } };
  }
  function buildProtocol(start, len) {
    const scale = (len || 30) / 30;
    return PROTO_PLANS[start].map(([st, base]) => {
      const minutes = base * scale;
      const def = st === -1 ? SET_BLOCK : st === 5 ? REFINE_BLOCK : STAGES[st];
      const cat = st === -1 ? 'Diagnose' : st === 5 ? 'Refine' : 'Stage ' + (st + 1) + ' of 5';
      return { id: uid(), cat, name: def.name, how: def.how, minutes, stage: st, rounds: 0, passed: false, score: null, notes: '' };
    });
  }
  const furthestPassed = (p) => p.items.reduce((m, it) => (it.stage >= 0 && it.stage <= 4 && it.passed ? Math.max(m, it.stage) : m), -1);

  function progressBlock() {
    const list = progressByMechanic();
    if (!list.length) return h('p', { class: 'hint', text: 'Your progress ladder appears here after your first protocol.' });
    return h('div', { class: 'ladders' }, list.map((e) => h('div', { class: 'ladder' },
      h('div', { class: 'ladder-top' },
        h('strong', { text: e.name }),
        h('span', { class: 'tag', text: e.furthest < 0 ? 'No stage completed yet' : 'Furthest: ' + STAGE_NAMES[e.furthest] })),
      h('div', { class: 'pips', 'aria-hidden': 'true' }, STAGE_SHORT.map((n, i) => h('span', { class: 'pip' + (i <= e.furthest ? ' on' : ''), text: n }))))));
  }

  /* ==========================================================
     Tracking: hours spent on each technique change
     ========================================================== */
  const fmtH = (v) => String(Math.round(v * 10) / 10);

  // Hours = the full time of every saved protocol session (30 minutes or 1 hour each), grouped by mechanic.
  function techniqueHours() {
    const map = new Map();
    for (const p of session.data.protocols) {
      const k = mechKey(p.mechanic);
      if (!k) continue;
      let e = map.get(k);
      if (!e) { e = { name: p.mechanic.trim(), minutes: 0, sessions: 0, last: p.date }; map.set(k, e); }
      e.minutes += p.items.reduce((a, it) => a + it.minutes, 0);
      e.sessions += 1;
      if (p.date >= e.last) { e.last = p.date; e.name = p.mechanic.trim(); }
    }
    return [...map.values()].map((e) => ({ ...e, hours: e.minutes / 60 })).sort((a, b) => b.hours - a.hours);
  }

  // Under 10 hours red, 10 up to 15 amber, 15 to 20 light green, over 20 dark green and Course Ready.
  function techStatus(hours) {
    if (hours > 20) return { cls: 'dg', label: 'Over 20 hours: Course Ready', short: 'Course Ready' };
    if (hours >= 15) return { cls: 'lg', label: '15 to 20 hours', short: '15 to 20 h' };
    if (hours >= 10) return { cls: 'am', label: '10 to 15 hours', short: '10 to 15 h' };
    return { cls: 'rd', label: 'Under 10 hours', short: 'Under 10 h' };
  }

  function trackingChart(rows) {
    const maxH = Math.max(...rows.map((r) => r.hours));
    const axisMax = Math.max(25, Math.ceil(maxH / 5) * 5);
    const W = 320, L = 8, R = 8, ROW = 46, TOP = 24, BOT = 22;
    const x = (v) => L + (v / axisMax) * (W - L - R);
    const H = TOP + rows.length * ROW + BOT;
    const svg = s('svg', {
      viewBox: '0 0 ' + W + ' ' + H, class: 'chart', role: 'img',
      'aria-label': 'Hours per technique change. ' + rows.map((r) => r.name + ': ' + fmtH(r.hours) + ' hours, ' + techStatus(r.hours).label).join('. ')
    });
    [10, 15, 20].forEach((v) => {
      svg.append(
        s('line', { x1: x(v), x2: x(v), y1: TOP - 6, y2: H - BOT, class: 'guide-line' }),
        s('text', { x: x(v), y: TOP - 10, class: 'axis', 'text-anchor': 'middle' }, v + ' h'));
    });
    rows.forEach((r, i) => {
      const y0 = TOP + i * ROW;
      const st = techStatus(r.hours);
      const name = r.name.length > 20 ? r.name.slice(0, 19) + '\u2026' : r.name;
      svg.append(
        s('text', { x: L, y: y0 + 12, class: 'bar-name' }, name),
        s('text', { x: W - R, y: y0 + 12, class: 'bar-val', 'text-anchor': 'end' }, fmtH(r.hours) + ' h, ' + st.short),
        s('rect', { x: L, y: y0 + 18, width: Math.max(2, x(r.hours) - L).toFixed(1), height: 16, rx: 2, class: 'bar-fill st-' + st.cls }));
    });
    svg.append(
      s('text', { x: L, y: H - 6, class: 'axis' }, '0'),
      s('text', { x: W - R, y: H - 6, class: 'axis', 'text-anchor': 'end' }, axisMax + ' h'));
    return svg;
  }

  function trackingView() {
    const rows = techniqueHours();
    const total = rows.reduce((a, r) => a + r.hours, 0);
    if (!rows.length) {
      return h('section', { class: 'stack' },
        h('h2', { text: 'Technique tracking' }),
        h('p', { class: 'empty', text: 'No protocol sessions saved yet. Run a protocol under Technique and the hours for each technique change appear here.' }));
    }
    const legend = [['rd', 'Under 10 hours'], ['am', '10 to 15 hours'], ['lg', '15 to 20 hours'], ['dg', 'Over 20 hours: Course Ready']];
    return h('section', { class: 'stack' },
      h('h2', { text: 'Technique tracking' }),
      h('p', { class: 'lead', text: fmtH(total) + ' hours across ' + rows.length + ' technique change' + (rows.length === 1 ? '' : 's') + '.' }),
      h('ul', { class: 'legend' }, legend.map(([c, l]) => h('li', null, h('span', { class: 'swatch st-' + c }), l))),
      trackingChart(rows),
      h('p', { class: 'hint', text: 'Hours add up the full time of each saved protocol, 30 minutes or 1 hour. Quick logs do not add hours. Exactly 15 or 20 hours counts as light green.' }));
  }

  // Slider between a 30 minute and a 1 hour session. Changing it rebuilds an unsaved plan with fewer or more drills.
  function lengthControl(kind, onChange) {
    const val = ui.len[kind];
    const left = h('span', { class: 'len-label' + (val === 30 ? ' on' : ''), text: '30 minutes' });
    const right = h('span', { class: 'len-label' + (val === 60 ? ' on' : ''), text: '1 hour' });
    const range = h('input', { type: 'range', min: 0, max: 1, step: 1, 'aria-label': 'Session length: 30 minutes or 1 hour' });
    range.value = val === 60 ? '1' : '0';
    range.addEventListener('input', () => {
      const v = range.value === '1' ? 60 : 30;
      left.classList.toggle('on', v === 30);
      right.classList.toggle('on', v === 60);
    });
    range.addEventListener('change', () => onChange(range.value === '1' ? 60 : 30));
    return h('div', { class: 'length' }, left, range, right);
  }
  function setTechniqueLength(len) {
    const d = drafts.protocol;
    if (len === ui.len.technique) return;
    if (d.items.length && d.items.some((i) => i.rounds > 0 || i.passed) && !window.confirm('Change the length? Progress you logged on this plan will be lost.')) { renderApp(); return; }
    ui.len.technique = len;
    if (d.items.length) { d.items = buildProtocol(d.start, len); d.len = len; d.timer = { base: 0, startedAt: null }; }
    renderApp();
  }
  function setSessionLength(kind, len) {
    const d = drafts[kind];
    if (len === ui.len[kind]) return;
    if (d && d.items.some((i) => i.score !== null) && !window.confirm('Change the length? Scores you entered on this plan will be lost.')) { renderApp(); return; }
    ui.len[kind] = len;
    if (d) drafts[kind] = { id: null, date: d.date, items: META[kind].gen(len), timer: { base: 0, startedAt: null }, len };
    renderApp();
  }

  function techniqueView() {
    let body;
    if (ui.mode === 'history') body = techniqueHistory();
    else if (ui.mode === 'log') body = techniqueForm();
    else body = drafts.protocol.items.length ? protocolSession(drafts.protocol) : protocolSetup(drafts.protocol);
    const showLength = ui.mode === 'new' && !drafts.protocol.id;
    return h('section', null,
      h('h2', { text: 'Technique practice' }),
      modeBar([['new', 'Protocol'], ['log', 'Quick log'], ['history', 'History']]),
      showLength ? lengthControl('technique', setTechniqueLength) : null,
      body);
  }

  function protocolSetup(d) {
    const known = () => progressByMechanic().some((e) => mechKey(e.name) === mechKey(d.mechanic));
    const mech = h('input', { type: 'text', maxlength: 200, list: 'mech-list', autocomplete: 'off', placeholder: 'For example: backswing turn', value: d.mechanic });
    const sel = h('select', null, STAGE_NAMES.map((n, i) => h('option', { value: String(i), text: n })));
    sel.value = String(d.start);
    const hint = h('p', { class: 'hint' });
    function updateHint() {
      hint.textContent = known()
        ? 'Suggested start: ' + STAGE_NAMES[suggestedStart(d.mechanic)] + ', based on your progress. Change it to repeat an earlier stage.'
        : 'New mechanic, so the suggested start is No club.';
    }
    mech.addEventListener('input', () => {
      d.mechanic = mech.value;
      if (!d.startTouched) { d.start = suggestedStart(d.mechanic); sel.value = String(d.start); }
      updateHint();
    });
    sel.addEventListener('change', () => { d.start = Number(sel.value); d.startTouched = true; });
    updateHint();

    return h('div', { class: 'stack' },
      h('p', { class: 'lead', text: 'Thirty minutes to change one mechanic. You move from no club to freezer swings, smoothie swings, a foam ball and then real balls, with five good swings in a row at each stage.' }),
      h('p', { class: 'hint', text: 'The goal is to change your pattern, not to hit good shots. Film yourself to check each swing hits the position. If one is wrong, start that set of five again.' }),
      progressBlock(),
      h('datalist', { id: 'mech-list' }, progressByMechanic().map((e) => h('option', { value: e.name }))),
      field('Date', dateInput(d)),
      field('Mechanic I am working on', mech),
      field('Position I am aiming for', textInput(d, 'target', 500, 'For example: lead wrist flat at the top')),
      field('Start at', sel),
      hint,
      h('button', {
        type: 'button', class: 'primary', text: 'Generate ' + (ui.len.technique === 60 ? '1-hour' : '30-minute') + ' protocol',
        onclick: () => {
          if (!d.mechanic.trim()) { toast('Add the mechanic you are working on'); return; }
          d.items = buildProtocol(d.start, ui.len.technique);
          d.len = ui.len.technique;
          d.timer = { base: 0, startedAt: null };
          renderApp();
        }
      }));
  }

  function protoCard(item, i) {
    const tracked = item.stage >= 0 && item.stage <= 4;
    const out = h('output', { class: 'score-out', text: String(item.rounds) });
    const step = (delta) => () => { item.rounds = Math.min(99, Math.max(0, item.rounds + delta)); out.textContent = String(item.rounds); };
    const cb = h('input', { type: 'checkbox' });
    cb.checked = !!item.passed;
    cb.addEventListener('change', () => { item.passed = cb.checked; });
    const notes = h('textarea', { rows: 2, maxlength: 3000, placeholder: 'Notes', 'aria-label': 'Notes for ' + item.name, value: item.notes });
    notes.addEventListener('input', () => { item.notes = notes.value; });
    return h('li', { class: 'drill' },
      h('div', { class: 'drill-head' },
        h('span', { class: 'idx', text: String(i + 1) }),
        h('h3', { text: item.name }),
        h('span', { class: 'tag', text: item.cat + ', ' + item.minutes + ' min' })),
      h('p', { class: 'how', text: item.how }),
      tracked ? h('div', { class: 'stepper' },
        h('span', { text: 'Sets of five attempted' }),
        h('button', { type: 'button', class: 'ghost', text: '\u2212', 'aria-label': 'One fewer set', onclick: step(-1) }),
        out,
        h('button', { type: 'button', class: 'ghost', text: '+', 'aria-label': 'One more set', onclick: step(1) })) : null,
      tracked ? h('label', { class: 'check' }, cb, 'Five good swings in a row completed') : null,
      notes);
  }

  function protocolSession(d) {
    const editing = !!d.id;
    const cards = d.items.map((it, i) => protoCard(it, i));
    async function save() {
      upsert(session.data.protocols, {
        id: d.id || uid(),
        date: isDate(d.date) ? d.date : today(),
        mechanic: d.mechanic.trim().slice(0, 200),
        target: d.target.trim().slice(0, 500),
        items: d.items.map((i) => ({ id: i.id, cat: i.cat, name: i.name, how: i.how, minutes: i.minutes, score: null, passed: !!i.passed, notes: i.notes.trim(), stage: i.stage, rounds: i.rounds })),
        notes: d.notes.trim().slice(0, 3000),
        next: d.next.trim().slice(0, 3000)
      });
      await persist();
      clearTimer();
      drafts.protocol = freshProtocol();
      ui.mode = 'history';
      renderApp(true);
      toast('Session saved');
    }
    function changeSetup() {
      if (d.items.some((i) => i.rounds > 0 || i.passed) && !window.confirm('Change the setup? Progress you logged will be lost.')) return;
      d.items = [];
      renderApp();
    }
    function discard() {
      if (!window.confirm(editing ? 'Discard your changes?' : 'Discard this session?')) return;
      drafts.protocol = freshProtocol();
      renderApp();
    }
    return h('div', { class: 'stack' },
      editing ? h('p', { class: 'banner', text: 'Editing an earlier session' }) : null,
      h('p', { class: 'banner', text: 'Mechanic: ' + d.mechanic + (d.target ? '. Target position: ' + d.target : '') }),
      field('Date', dateInput(d)),
      editing ? null : timerWidget(d, cards),
      h('ol', { class: 'drills' }, cards),
      field('How the session went', textArea(d, 'notes', 4, 3000)),
      field('What to do next session', textArea(d, 'next', 4, 3000)),
      h('div', { class: 'actions' },
        h('button', { type: 'button', class: 'primary', text: editing ? 'Save changes' : 'Save session', onclick: save }),
        editing ? null : h('button', { type: 'button', class: 'ghost', text: 'Change setup', onclick: changeSetup }),
        h('button', { type: 'button', class: 'ghost', text: editing ? 'Cancel edit' : 'Discard', onclick: discard })));
  }

  function techniqueForm() {
    const d = drafts.technique;
    async function save() {
      if (!d.mechanics.trim()) { toast('Add the mechanics you worked on'); return; }
      upsert(session.data.technique, {
        id: d.id || uid(),
        date: isDate(d.date) ? d.date : today(),
        mechanics: d.mechanics.trim().slice(0, 200),
        notes: d.notes.trim().slice(0, 3000),
        improve: d.improve.trim().slice(0, 3000)
      });
      await persist();
      drafts.technique = freshDrafts().technique;
      ui.mode = 'history';
      renderApp(true);
      toast('Entry saved');
    }
    return h('div', { class: 'stack' },
      d.id ? h('p', { class: 'banner', text: 'Editing an earlier entry' }) : null,
      field('Date', dateInput(d)),
      field('Mechanics I worked on', textInput(d, 'mechanics', 200, 'For example: shallower lead wrist at the top')),
      field('How the practice went', textArea(d, 'notes', 5, 3000)),
      field('How to improve the next practice', textArea(d, 'improve', 5, 3000)),
      h('div', { class: 'actions' },
        h('button', { type: 'button', class: 'primary', text: d.id ? 'Save changes' : 'Save entry', onclick: save }),
        d.id ? h('button', { type: 'button', class: 'ghost', text: 'Cancel edit', onclick: () => { drafts.technique = freshDrafts().technique; renderApp(); } }) : null));
  }

  function techniqueHistory() {
    const entries = [
      ...session.data.technique.map((rec) => ({ type: 'log', rec })),
      ...session.data.protocols.map((rec) => ({ type: 'protocol', rec }))
    ].sort((a, b) => b.rec.date.localeCompare(a.rec.date));
    const nodes = [progressBlock()];
    if (!entries.length) nodes.push(h('p', { class: 'empty', text: 'No entries yet. Run a 30-minute protocol or add a quick log.' }));
    entries.forEach(({ type, rec }) => {
      if (type === 'log') {
        nodes.push(entryShell(
          [h('span', { class: 'd', text: fmtDate(rec.date) }), h('span', { class: 'sum', text: rec.mechanics })],
          [
            h('div', null, h('strong', { text: 'Mechanics' }), h('p', { class: 'notes', text: rec.mechanics })),
            rec.notes ? h('div', null, h('strong', { text: 'How it went' }), h('p', { class: 'notes', text: rec.notes })) : null,
            rec.improve ? h('div', null, h('strong', { text: 'Improve next time' }), h('p', { class: 'notes', text: rec.improve })) : null
          ],
          () => { drafts.technique = { ...rec }; ui.mode = 'log'; renderApp(true); },
          () => removeRecord('technique', rec.id)));
      } else {
        const fp = furthestPassed(rec);
        nodes.push(entryShell(
          [h('span', { class: 'd', text: fmtDate(rec.date) }), h('span', { class: 'sum', text: rec.mechanic + (fp >= 0 ? ', reached ' + STAGE_SHORT[fp] : '') })],
          [
            h('div', null, h('strong', { text: '30-minute protocol' }), rec.target ? h('p', { class: 'notes', text: 'Target position: ' + rec.target }) : null),
            rec.items.map((it) => h('div', { class: 'hist-item' },
              h('strong', { text: it.name }),
              h('p', { class: 'tag', text: it.cat + ', ' + it.minutes + ' min' }),
              it.stage >= 0 && it.stage <= 4 ? h('p', { text: it.rounds + ' set' + (it.rounds === 1 ? '' : 's') + ' attempted, ' + (it.passed ? 'five in a row completed' : 'not completed') }) : null,
              it.notes ? h('p', { class: 'notes', text: it.notes }) : null)),
            rec.notes ? h('div', null, h('strong', { text: 'How it went' }), h('p', { class: 'notes', text: rec.notes })) : null,
            rec.next ? h('div', null, h('strong', { text: 'Next session' }), h('p', { class: 'notes', text: rec.next })) : null
          ],
          () => { drafts.protocol = { id: rec.id, date: rec.date, mechanic: rec.mechanic, target: rec.target, start: 0, startTouched: true, items: rec.items.map((i) => ({ ...i })), notes: rec.notes, next: rec.next, timer: { base: 0, startedAt: null } }; ui.mode = 'new'; renderApp(true); },
          () => removeRecord('protocols', rec.id)));
      }
    });
    return h('div', null, nodes);
  }

  /* ==========================================================
     Sections 2 and 3: timed sessions
     ========================================================== */
  const mkItem = (x, cat, minutes) => ({ id: uid(), cat, name: x.name, how: x.how, minutes, score: null, passed: false, notes: '' });

  // Names of games used in your two most recent sessions, so a new plan avoids repeating them.
  function recentNames(kind) {
    return new Set([...session.data[kind]].sort(byDateDesc).slice(0, 2).flatMap((r) => r.items.map((i) => i.name)));
  }

  function genCalibration(len) {
    const per = (len || 30) / 30; // 1 game per category for 30 minutes, 2 for one hour
    const seen = recentNames('calibration');
    const out = [];
    for (const c of Object.keys(CAL)) {
      const fresh = CAL[c].filter((g) => !seen.has(g.name));
      shuffle(fresh.length >= per ? fresh : CAL[c]).slice(0, per).forEach((g) => out.push(mkItem(g, c, CAL_BLOCK_MINUTES)));
    }
    return out;
  }
  function genTransfer(len) {
    const n = (len || 30) / TRANSFER_BLOCK_MINUTES; // 3 games for 30 minutes, 6 for one hour
    const anchor = TRANSFER.find((g) => g.name === ANCHOR);
    const seen = recentNames('transfer');
    let pool = TRANSFER.filter((g) => g.name !== ANCHOR && !seen.has(g.name));
    if (pool.length < n - 1) pool = TRANSFER.filter((g) => g.name !== ANCHOR);
    const rest = shuffle(pool).slice(0, n - 1);
    return [anchor, ...rest].map((x) => mkItem(x, x.cat, TRANSFER_BLOCK_MINUTES));
  }

  const META = {
    calibration: {
      title: 'Calibration practice', unit: 'drill', gen: genCalibration,
      intro: (len) => (len === 60 ? 'An hour' : 'Thirty minutes') + ' of structured calibration: ' + (len === 60 ? 'six ten-minute games, two each' : 'three ten-minute games, one each') + ' for face strike, low point and clubface direction. You never change club or target. Instead the part of the face you strike, your contact, your shot shape and your start line step through a fixed order and then switch from ball to ball. Every game is 15 balls or fewer. Score each game out of 10.'
    },
    transfer: {
      title: 'Transfer training', unit: 'test', gen: genTransfer,
      intro: (len) => (len === 60 ? 'An hour' : 'Thirty minutes') + ' of course-style games you can play at a driving range: ' + (len === 60 ? 'six' : 'three') + ' ten-minute games drawn from seventeen. Targets and clubs change on every ball, you use your full routine, there is a consequence for a miss, and your attention stays on the target. The first game always tests the new move from your technique protocol under pressure. Score each game out of 10 and tick Passed when you meet its pass mark.'
    }
  };

  function sessionsView(kind) {
    const meta = META[kind];
    if (ui.mode === 'log') ui.mode = 'new';
    return h('section', null,
      h('h2', { text: meta.title }),
      modeBar('New session'),
      ui.mode !== 'history' && !(drafts[kind] && drafts[kind].id) ? lengthControl(kind, (len) => setSessionLength(kind, len)) : null,
      ui.mode === 'history' ? sessionHistory(kind) : sessionNew(kind));
  }

  function sessionNew(kind) {
    const meta = META[kind];
    if (!drafts[kind]) {
      return h('div', { class: 'stack' },
        h('p', { class: 'lead', text: meta.intro(ui.len[kind]) }),
        h('button', {
          type: 'button', class: 'primary', text: 'Generate ' + (ui.len[kind] === 60 ? '1-hour' : '30-minute') + ' session',
          onclick: () => { const len = ui.len[kind]; drafts[kind] = { id: null, date: today(), items: meta.gen(len), timer: { base: 0, startedAt: null }, len }; renderApp(); }
        }));
    }
    return sessionForm(kind);
  }

  function itemCard(kind, item, i) {
    const out = h('output', { class: 'score-out', text: item.score == null ? 'Not scored' : item.score + ' / 10' });
    const range = h('input', { type: 'range', min: 0, max: 10, step: 1, 'aria-label': 'Score for ' + item.name });
    range.value = item.score == null ? 5 : item.score;
    range.addEventListener('input', () => { item.score = Number(range.value); out.textContent = item.score + ' / 10'; });

    let passed = null;
    if (kind === 'transfer') {
      const cb = h('input', { type: 'checkbox' });
      cb.checked = !!item.passed;
      cb.addEventListener('change', () => { item.passed = cb.checked; });
      passed = h('label', { class: 'check' }, cb, 'Passed');
    }
    const notes = h('textarea', { rows: 2, maxlength: 3000, placeholder: 'Notes', 'aria-label': 'Notes for ' + item.name, value: item.notes });
    notes.addEventListener('input', () => { item.notes = notes.value; });

    return h('li', { class: 'drill' },
      h('div', { class: 'drill-head' },
        h('span', { class: 'idx', text: String(i + 1) }),
        h('h3', { text: item.name }),
        h('span', { class: 'tag', text: item.cat + ', ' + item.minutes + ' min' })),
      h('p', { class: 'how', text: item.how }),
      h('div', { class: 'score-row' }, range, out),
      passed, notes);
  }

  function fmtClock(sec) {
    sec = Math.max(0, Math.ceil(sec));
    return String(Math.floor(sec / 60)).padStart(2, '0') + ':' + String(sec % 60).padStart(2, '0');
  }

  function timerWidget(d, cards) {
    const t = d.timer;
    const total = d.items.reduce((a, i) => a + i.minutes * 60, 0);
    const clock = h('div', { class: 'clock', role: 'timer' });
    const nowLabel = h('p', { class: 'now-label' });
    const fills = [];
    const segs = d.items.map((it) => {
      const f = h('span', { class: 'fill' });
      fills.push(f);
      const seg = h('span', { class: 'tseg' }, f);
      seg.style.flexGrow = String(it.minutes);
      return seg;
    });
    const toggle = h('button', { type: 'button', class: 'primary' });
    const reset = h('button', { type: 'button', class: 'ghost', text: 'Reset timer' });

    const elapsed = () => Math.min(total, t.base + (t.startedAt ? (Date.now() - t.startedAt) / 1000 : 0));

    function paint() {
      let e = elapsed();
      if (t.startedAt && e >= total) {
        t.base = total; t.startedAt = null; e = total;
        clearTimer();
        if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
      }
      clock.textContent = fmtClock(total - e);
      let acc = 0, cur = -1;
      d.items.forEach((it, i) => {
        const len = it.minutes * 60;
        fills[i].style.width = (Math.min(1, Math.max(0, (e - acc) / len)) * 100) + '%';
        if (e >= acc && e < acc + len) cur = i;
        acc += len;
      });
      segs.forEach((sg, i) => sg.classList.toggle('on', i === cur));
      cards.forEach((c, i) => c.classList.toggle('now', i === cur));
      if (e >= total) nowLabel.textContent = 'Time is up. Finish scoring below.';
      else if (t.startedAt) nowLabel.textContent = 'Now: ' + d.items[cur].name;
      else nowLabel.textContent = e > 0 ? 'Paused' : 'Press Start when you are ready.';
      toggle.textContent = t.startedAt ? 'Pause' : (e > 0 && e < total ? 'Resume' : 'Start');
    }
    function startTick() { clearTimer(); tickHandle = setInterval(paint, 250); }

    toggle.addEventListener('click', () => {
      if (t.startedAt) { t.base = elapsed(); t.startedAt = null; clearTimer(); }
      else { if (t.base >= total) t.base = 0; t.startedAt = Date.now(); startTick(); }
      paint();
    });
    reset.addEventListener('click', () => { t.base = 0; t.startedAt = null; clearTimer(); paint(); });

    if (t.startedAt) startTick();
    paint();
    return h('div', null, clock, h('div', { class: 'timeline', 'aria-hidden': 'true' }, segs), nowLabel, h('div', { class: 'actions' }, toggle, reset));
  }

  // Converts a shot distance into the width of one finger: about 3.3 yards at 100, 5 at 150 and 6.6 at 200.
  function fingerCalc(d) {
    const out = h('p', { class: 'hint' });
    const input = h('input', { type: 'text', inputmode: 'numeric', maxlength: 3, placeholder: '150', 'aria-label': 'Shot distance in yards', value: d.dist || '' });
    function update() {
      const dist = Number(input.value);
      if (!input.value || !Number.isFinite(dist) || dist < 20 || dist > 400) { out.textContent = 'Enter a shot distance to see how wide a finger is.'; return; }
      const f = Math.round(dist * 0.33) / 10;
      out.textContent = 'At ' + dist + ' yards, 1 finger = ' + f.toFixed(1) + ' yards. 2 fingers = ' + (2 * f).toFixed(1) + ', 4 = ' + (4 * f).toFixed(1) + ', 6 = ' + (6 * f).toFixed(1) + ', 8 = ' + (8 * f).toFixed(1) + ' yards wide.';
    }
    input.addEventListener('input', () => { d.dist = input.value.replace(/[^0-9]/g, ''); update(); });
    update();
    return h('div', null, field('Finger calculator: shot distance in yards', input, '1 finger is about 3.3 yards at 100 yards, 5 at 150 and 6.6 at 200.'), out);
  }

  function sessionForm(kind) {
    const d = drafts[kind];
    const meta = META[kind];
    const editing = !!d.id;
    const cards = d.items.map((it, i) => itemCard(kind, it, i));

    async function save() {
      if (!d.items.some((i) => i.score !== null)) { toast('Score at least one ' + meta.unit); return; }
      upsert(session.data[kind], {
        id: d.id || uid(),
        date: isDate(d.date) ? d.date : today(),
        items: d.items.map((i) => ({ id: i.id, cat: i.cat, name: i.name, how: i.how, minutes: i.minutes, score: i.score, passed: !!i.passed, notes: i.notes.trim() }))
      });
      await persist();
      drafts[kind] = null;
      ui.mode = 'history';
      renderApp(true);
      toast('Session saved');
    }
    function regenerate() {
      if (d.items.some((i) => i.score !== null) && !window.confirm('Replace this plan? Scores you entered will be lost.')) return;
      const len = d.len || ui.len[kind];
      drafts[kind] = { id: null, date: d.date, items: meta.gen(len), timer: { base: 0, startedAt: null }, len };
      renderApp();
    }
    function discard() {
      if (!window.confirm(editing ? 'Discard your changes?' : 'Discard this session?')) return;
      drafts[kind] = null;
      renderApp();
    }

    return h('div', { class: 'stack' },
      editing ? h('p', { class: 'banner', text: 'Editing an earlier session' }) : null,
      field('Date', dateInput(d)),
      editing ? null : fingerCalc(d),
      editing ? null : timerWidget(d, cards),
      h('ol', { class: 'drills' }, cards),
      h('div', { class: 'actions' },
        h('button', { type: 'button', class: 'primary', text: editing ? 'Save changes' : 'Save session', onclick: save }),
        editing ? null : h('button', { type: 'button', class: 'ghost', text: 'New plan', onclick: regenerate }),
        h('button', { type: 'button', class: 'ghost', text: editing ? 'Cancel edit' : 'Discard', onclick: discard })));
  }

  function sessionSummary(kind, rec) {
    const scored = rec.items.filter((i) => i.score != null);
    if (!scored.length) return 'No scores';
    if (kind === 'calibration') return 'Average ' + avgArr(scored.map((i) => i.score)).toFixed(1);
    const pts = scored.reduce((a, i) => a + i.score, 0);
    const passed = rec.items.filter((i) => i.passed).length;
    return pts + ' of ' + rec.items.length * 10 + ' points, ' + passed + ' of ' + rec.items.length + ' passed';
  }

  function sessionHistory(kind) {
    const list = [...session.data[kind]].sort(byDateDesc);
    if (!list.length) return h('p', { class: 'empty', text: 'No sessions yet. Generate your first one under New session.' });
    const nodes = [];
    if (kind === 'calibration') nodes.push(chartBlock(session.data.calibration));
    list.forEach((rec) => {
      nodes.push(entryShell(
        [h('span', { class: 'd', text: fmtDate(rec.date) }), h('span', { class: 'sum', text: sessionSummary(kind, rec) })],
        rec.items.map((it) => h('div', { class: 'hist-item' },
          h('strong', { text: it.name }),
          h('p', { class: 'tag', text: it.cat + ', ' + it.minutes + ' min' }),
          h('p', { text: it.score == null ? 'Not scored' : 'Score ' + it.score + ' / 10' + (kind === 'transfer' ? (it.passed ? ', passed' : ', not passed') : '') }),
          it.notes ? h('p', { class: 'notes', text: it.notes }) : null)),
        () => { drafts[kind] = { id: rec.id, date: rec.date, items: rec.items.map((i) => ({ ...i })), timer: { base: 0, startedAt: null } }; ui.mode = 'new'; renderApp(true); },
        () => removeRecord(kind, rec.id)));
    });
    return h('div', null, nodes);
  }

  function chartBlock(sessions) {
    const sorted = [...sessions].sort((a, b) => a.date.localeCompare(b.date)).slice(-20);
    if (sorted.length < 2) return h('p', { class: 'hint', text: 'Log two or more sessions to see your trend by category.' });
    const cats = Object.keys(CAL);
    const W = 320, H = 170, L = 24, R = 8, T = 8, B = 24;
    const x = (i) => L + i * (W - L - R) / (sorted.length - 1);
    const y = (v) => T + (10 - v) * (H - T - B) / 10;
    const svg = s('svg', { viewBox: '0 0 ' + W + ' ' + H, class: 'chart', role: 'img', 'aria-label': 'Average score for each category across your calibration sessions' });
    [0, 5, 10].forEach((v) => {
      svg.append(s('line', { x1: L, x2: W - R, y1: y(v), y2: y(v), class: 'grid' }),
        s('text', { x: L - 4, y: y(v) + 3, class: 'axis', 'text-anchor': 'end' }, String(v)));
    });
    cats.forEach((c, ci) => {
      const pts = sorted.map((rec, i) => {
        const sc = rec.items.filter((it) => it.cat === c && it.score != null).map((it) => it.score);
        return sc.length ? { x: x(i), y: y(avgArr(sc)) } : null;
      }).filter(Boolean);
      if (pts.length > 1) svg.append(s('polyline', { points: pts.map((p) => p.x.toFixed(1) + ',' + p.y.toFixed(1)).join(' '), class: 'line l' + ci }));
      pts.forEach((p) => svg.append(s('circle', { cx: p.x.toFixed(1), cy: p.y.toFixed(1), r: 3, class: 'pt l' + ci })));
    });
    svg.append(s('text', { x: L, y: H - 8, class: 'axis' }, shortDate(sorted[0].date)),
      s('text', { x: W - R, y: H - 8, class: 'axis', 'text-anchor': 'end' }, shortDate(sorted[sorted.length - 1].date)));
    return h('div', null, svg,
      h('ul', { class: 'legend' }, cats.map((c, ci) => h('li', null, h('span', { class: 'swatch l' + ci }), c))));
  }

  /* ==========================================================
     Settings: backup, restore, change passphrase, erase
     ========================================================== */
  // Uses the iPhone share sheet when available (choose Save to Files or iCloud Drive), otherwise downloads a file.
  async function exportBackup() {
    const raw = localStorage.getItem(VAULT_KEY);
    if (!raw) return false;
    const name = 'golf-practice-backup-' + today() + '.json';
    try {
      const f = new File([raw], name, { type: 'application/json' });
      if (navigator.canShare && navigator.canShare({ files: [f] })) {
        await navigator.share({ files: [f], title: 'Golf practice backup' });
        markBackup();
        return true;
      }
    } catch (e) {
      if (e && e.name === 'AbortError') return false; // you closed the share sheet
    }
    const url = URL.createObjectURL(new Blob([raw], { type: 'application/json' }));
    const a = h('a', { href: url, download: name });
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    markBackup();
    return true;
  }

  function settingsView() {
    const status = () => h('p', { class: 'msg', role: 'status' });

    // Backup
    const expMsg = status();
    const storageNote = h('p', { class: 'hint', text: '' });
    if (navigator.storage && navigator.storage.persisted) {
      navigator.storage.persisted().then((ok) => {
        storageNote.textContent = ok ? 'Browser storage protection: on.' : 'Browser storage protection: not granted by this browser. Regular backups are your safety net.';
      }).catch(() => {});
    }
    // Restore
    const file = h('input', { type: 'file', accept: 'application/json,.json', 'aria-label': 'Backup file' });
    const bpass = h('input', { type: 'password', autocomplete: 'off', autocapitalize: 'off', 'aria-label': 'Passphrase the backup was made with' });
    const impMsg = status();
    const restoreBtn = h('button', { type: 'button', class: 'ghost', text: 'Restore backup' });
    restoreBtn.addEventListener('click', async () => {
      impMsg.className = 'msg';
      const f = file.files && file.files[0];
      if (!f || f.size > 20 * 1024 * 1024) { impMsg.textContent = 'Choose a backup file first.'; return; }
      if (!bpass.value) { impMsg.textContent = 'Enter the passphrase the backup was made with.'; return; }
      restoreBtn.disabled = true;
      impMsg.textContent = 'Checking backup...';
      try {
        const v = parseVault(await f.text());
        const key = await deriveKey(bpass.value, fromB64(v.salt), v.iter);
        const data = cleanData(await decryptData(key, v.iv, v.ct));
        if (!window.confirm('Replace everything in this log with the backup?')) { impMsg.textContent = ''; restoreBtn.disabled = false; return; }
        session.data = data;
        await persist();
        bpass.value = ''; file.value = '';
        impMsg.className = 'msg ok';
        impMsg.textContent = 'Backup restored.';
      } catch (err) {
        impMsg.textContent = 'Could not open that backup. Check the file and passphrase.';
      }
      restoreBtn.disabled = false;
    });

    // Change passphrase
    const cur = h('input', { type: 'password', autocomplete: 'current-password', autocapitalize: 'off', 'aria-label': 'Current passphrase' });
    const n1 = h('input', { type: 'password', autocomplete: 'new-password', autocapitalize: 'off', 'aria-label': 'New passphrase' });
    const n2 = h('input', { type: 'password', autocomplete: 'new-password', autocapitalize: 'off', 'aria-label': 'Repeat new passphrase' });
    const pwMsg = status();
    const pwBtn = h('button', { type: 'button', class: 'primary', text: 'Change passphrase' });
    pwBtn.addEventListener('click', async () => {
      pwMsg.className = 'msg';
      if (n1.value.length < 12) { pwMsg.textContent = 'Use at least 12 characters.'; return; }
      if (n1.value !== n2.value) { pwMsg.textContent = 'The new passphrases do not match.'; return; }
      pwBtn.disabled = true;
      pwMsg.textContent = 'Working...';
      try {
        const v = parseVault(localStorage.getItem(VAULT_KEY));
        const k = await deriveKey(cur.value, fromB64(v.salt), v.iter);
        await decryptData(k, v.iv, v.ct); // proves the current passphrase
        const salt = crypto.getRandomValues(new Uint8Array(16));
        session.key = await deriveKey(n1.value, salt, PBKDF2_ITER);
        session.salt = salt;
        session.iter = PBKDF2_ITER;
        await persist();
        cur.value = ''; n1.value = ''; n2.value = '';
        pwMsg.className = 'msg ok';
        pwMsg.textContent = 'Passphrase changed. Old backups still need the old passphrase.';
      } catch (err) {
        pwMsg.textContent = 'The current passphrase did not work.';
      }
      pwBtn.disabled = false;
    });

    return h('section', { class: 'stack' },
      h('h2', { text: 'Settings' }),
      h('div', { class: 'panel' },
        h('h3', { text: 'Back up' }),
        h('p', { text: 'Saves an encrypted copy of your log. On iPhone, choose Save to Files and pick iCloud Drive. It can only be opened with your passphrase, so it is safe to keep in cloud storage.' }),
        h('div', { class: 'actions' }, h('button', { type: 'button', class: 'primary', text: 'Back up now', onclick: async () => { expMsg.className = 'msg'; expMsg.textContent = ''; if (await exportBackup()) { expMsg.className = 'msg ok'; expMsg.textContent = 'Backup saved.'; } } })),
        expMsg,
        storageNote),
      h('div', { class: 'panel' },
        h('h3', { text: 'Restore' }),
        h('p', { text: 'Replaces this log with a backup file. Enter the passphrase that backup was made with.' }),
        file, bpass, h('div', { class: 'actions' }, restoreBtn), impMsg),
      h('div', { class: 'panel' },
        h('h3', { text: 'Change passphrase' }),
        cur, n1, n2, h('div', { class: 'actions' }, pwBtn), pwMsg),
      h('div', { class: 'panel' },
        h('h3', { text: 'Erase everything' }),
        h('p', { text: 'Deletes your log from this device. Download a backup first if you want to keep it.' }),
        h('div', { class: 'actions' }, h('button', { type: 'button', class: 'danger', text: 'Erase all data', onclick: eraseAll }))));
  }

  renderLock();
})();
