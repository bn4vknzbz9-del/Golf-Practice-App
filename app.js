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
  // Target sizes are written in yards with feet in brackets, set for a shot of about 150 yards.
  // The yards-to-fingers slider on each session page converts a width to fingers at your distance.
  const Y = (y) => +y.toFixed(1) + ' yards (' + Math.round(y * 3) + ' feet)';
  // A window written for 150 yards, scaled to a wedge (about 100 yards) or a driver (about 250 yards).
  const Yw = (y) => Y(Math.round(((y * 100) / 150) * 10) / 10);
  const Yd = (y) => Y(Math.round(((y * 250) / 150) * 10) / 10);
  // Sizes in a game that does not name its club are written as tokens and scaled to the club picked on the drill card.
  const T = (y) => '{{y:' + y + '}}'; // a window written for 150 yards
  const N = (n) => '{{n:' + n + '}}'; // a plain number that scales with the club, such as points
  const CLUBS = [['Wedge (about 100 yards)', 100, 'wedge'], ['Short iron (about 125 yards)', 125, 'short iron'], ['Mid-iron (about 150 yards)', 150, 'mid-iron'],
    ['Long iron or hybrid (about 200 yards)', 200, 'long iron or hybrid'], ['Driver (about 250 yards)', 250, 'driver']];
  function renderHow(how, dist) {
    const d = dist || 150;
    const k = d / 150;
    const club = CLUBS.find((c) => c[1] === d) || CLUBS[2];
    return how
      .replace(/\{\{y:([\d.]+)\}\}/g, (m, y) => Y(Math.round(Number(y) * k * 10) / 10))
      .replace(/\{\{n:([\d.]+)\}\}/g, (m, n) => String(Math.round(Number(n) * k)))
      .replace(/\{\{Club\}\}/g, 'A ' + club[2])
      .replace(/\{\{club\}\}/g, 'a ' + club[2]);
  }
  const BY_CLUB = (y) => 'wedge (about 100 yards) ' + Yw(y) + ', mid-iron (about 150 yards) ' + Y(y) + ' and driver (about 250 yards) ' + Yd(y);

  // G(name, setup, play, interleave rule, scoring) builds a practice game.
  // Every game must have an interleave rule: change club, target, shot or set-up from ball to ball.
  const G = (name, setup, play, interleave, score, cat, balls, pointsMax) => ({
    name, cat, balls, pointsMax,
    how: ['Setup: ' + setup, 'Play: ' + play, 'Interleave: ' + interleave, 'Score: ' + score].join('\n')
  });
  const PICK = 'Use a die, a deck of cards or a random-number app to choose.';

  // GC builds a calibration game. Calibration is structured and blocked on purpose:
  // one club and one target, with a single variable stepped through a fixed order. Nothing is randomised.
  const GC = (name, setup, constant, steps, score, balls) => ({
    name, balls,
    how: ['Setup: ' + setup, 'Keep constant: ' + constant, 'Steps:\n' + steps.map((x, i) => (i + 1) + '. ' + x).join('\n'), 'Score: ' + score].join('\n')
  });

  // SH marks a drill that gets its category's shared Switch block (written once, further down).
  const SH = (g) => ({ ...g, shared: true });

  const CAL = {
    'Face strike': [
      GC('Full Face Spectrum',
        'Spray or tape on one mid-iron. One target.',
        'Club, target and ball position stay the same for the whole game.',
        ['2 balls struck toward the heel on purpose.', '2 balls struck toward the toe on purpose.', '1 ball high on the face, then 1 low.', '5 balls switching between heel and toe on every ball, starting with heel.', '4 balls aiming for dead centre.'],
        'Balls struck where you aimed (heel, toe, high, low or centre), out of 15. Check the mark after every ball and say what it felt like.', 15),
      GC('Heel/Toe ladder',
        'Spray or tape on a wedge. Use a clear ruler or a pen to mark a centre line, and lines every 5 mm toward the heel and the toe, on the tape. One target.',
        'Same club and target. Only the strike position on the face changes.',
        ['One ball per rung, working across the face: 10 mm toward the heel, 5 mm, centre, 5 mm toward the toe, 10 mm.', 'Then one ball per rung back the other way.', '5 balls aiming for centre.'],
        'Balls struck within 3 mm of the position you aimed for, out of 15.', 15),
      GC('Find your edges',
        'Spray or tape on a mid-iron. Count the grooves up from the bottom edge. One target.',
        'Same club, target and ball position.',
        ['2 balls struck low on the face, around the 2nd groove. Notice where the shot stops being useful.', '2 balls struck high on the face, around the 5th groove. Notice the same.', '3 balls switching between the low edge and the high edge, starting low.', '8 balls switching between the 2nd groove, 3rd groove and the 4th groove on every ball, starting with the 2nd.'],
        'Balls struck on the groove or edge you called, out of 15. Write down which edge you drift toward.', 15),
      GC('Tee height staircase',
        'Spray or tape on your driver. One club for the whole game, one tee and one target.',
        'Same club and target. Only the tee height changes, and only in this order.',
        ['2 balls on a low tee.', '2 balls on a medium tee.', '2 balls on a high tee.', '2 balls on medium, then 2 on low, then 2 on high.', '3 balls on the tee height that gave your best strikes.'],
        'Centre strikes, out of 15. Write down which tee height gave your best strikes.', 15),
      GC('Ball position staircase',
        'Spray or tape on a mid-iron. Mark five ball positions from well back to well forward in your stance. One target.',
        'Same club and target. Only the ball position changes, in order.',
        ['3 balls with the ball well back.', '3 balls slightly back, 3 in the middle, 3 slightly forward, then 3 well forward.', 'Note which position gives your most central strikes.'],
        'Centre strikes, out of 15.', 15),
      GC('Wedge length staircase',
        'Spray or tape on a wedge. One target.',
        'Same club and target. Only the swing length changes.',
        ['3 half swings.', '3 three-quarter swings, then 3 full swings.', 'Come back down: 3 three-quarter swings, then 3 half swings.'],
        'Centre strikes, out of 15. Note whether strike quality changes with swing length.', 15),
      GC('Effort staircase',
        'Spray or tape on a mid-iron. One target.',
        'Same club and target. Only your effort level changes.',
        ['2 balls at about 50 percent effort.', '3 balls at 70 percent.', '3 balls at 85 percent.', '3 balls at 100 percent.', '4 balls moving from 50 percent, 70 percent, 85 percent and 100 percent.'],
        'Centre strikes, out of 15. Note the effort level where your strikes are best.', 15),
      GC('Strike map',
        'Spray or tape on a mid-iron. Draw a grid on paper or your phone: three columns (heel, centre, toe) by three rows (high, middle, low). One target.',
        'Everything stays the same for all 15 balls.',
        ['Hit 15 balls with your normal swing and intention.', 'After every ball, tally the strike in the grid.', 'Try and adjust your strike feel to stay in the centre of the face.', 'Look at the grid: where is the middle of your pattern, and how wide is it?'],
        'Strikes in the centre cell, out of 15. Write down the direction your pattern leans.', 15),
      GC('Strike, then predict',
        'Spray or tape on a mid-iron. One target.',
        'Same club and target for the whole game.',
        ['12 balls. After impact, and before you look at the face, call the strike (toe, centre or heel, and high, middle or low).', 'Check the mark and note whether your call was right.'],
        'Balls where your call matched the mark, out of 12. Also note how many were centre strikes.', 12),
      GC('High and low switch',
        'Spray or tape on a mid-iron. Count the grooves up from the bottom edge. One target.',
        'Same club, target and ball position. Only the strike height on the face changes, and it switches on every ball.',
        ['5 balls switching between high on the face (around the 5th groove) and low (around the 2nd groove), starting low.', '5 balls switching low, middle, high, middle, then repeating.', '5 balls aiming for the middle, around the 3rd to 4th groove.', 'Note how this affects your low point.'],
        'Balls struck in the zone you called or aimed for, out of 15.', 15),
      GC('Four corners switch',
        'Spray or tape on a mid-iron. Think of the face as four quarters: heel-high, toe-high, toe-low and heel-low. One target.',
        'Same club, target and ball position. Only the strike zone changes, on every ball.',
        ['Work around the face one ball per zone: heel-high, toe-high, toe-low, heel-low, then centre. Repeat the cycle 2 times (10 balls).', '5 balls aiming for centre.'],
        'Balls struck in the zone you called, out of 15.', 15)
    ],
    'Low point': [
      GC('Fat to thin spectrum',
        'A mid-iron and a line on the turf. Ball on or just ahead of the line. One target.',
        'Same club, target and ball position.',
        ['2 balls hit deliberately fat (divot well behind the ball).', '2 balls hit deliberately thin (clip the ball, almost no divot).', '4 balls switching fat, thin, fat, thin.', '1 slightly fat, then 1 slightly thin.', '5 balls with ball-first contact and the divot starting at or just ahead of the line.'],
        'Balls with the contact you aimed for (fat, thin or clean), out of 15. Look at every divot and say where you felt the low point.', 15),
      SH(GC('Towel gate progression',
        'An 8-iron (one club for the whole game), a towel or headcover and one target.',
        'Same club and target. Only the gap between the towel and the ball changes.',
        ['2 balls with the towel about 6 inches behind the ball.', 'Then 2 balls each at 4, 3, 2 and 1 inch, moving the towel closer each time.'],
        'Balls with clean ball-first contact and no towel contact, out of 10, plus the switch balls that matched your call, out of 4. Total out of 14.', 14)),
      SH(GC('Ball position staircase',
        'A mid-iron and a line on the turf. Five ball positions from well back to well forward. One target.',
        'Same club and target. Only the ball position changes, in order.',
        ['2 balls with the ball well back.', '2 balls slightly back, 2 in the middle, 2 slightly forward, then 2 well forward.', 'Look at where each divot starts relative to the ball.'],
        'Balls with ball-first contact, out of 10, plus the switch balls that matched your call, out of 4. Total out of 14. Note which position gave you the cleanest contact.', 14)),
      SH(GC('Shaft lean staircase',
        'A mid-iron and one target.',
        'Same club and target. Only the amount of shaft lean at impact changes (by feel).',
        ['3 balls with very little shaft lean.', '3 balls with a moderate amount.', '3 balls with a lot of shaft lean.', '2 balls back at the moderate amount.'],
        'Balls with ball-first contact, out of 11, plus the switch balls that matched your call, out of 4. Total out of 15. Note which amount gave your cleanest contact.', 15)),
      SH(GC('Divot depth staircase',
        'A mid-iron, one target and a divot board.',
        'Same club and target. Only the depth of the divot changes.',
        ['2 balls brushing the grass with almost no divot.', '2 balls with a shallow divot, then 2 with a deeper divot.', '2 balls back at shallow, then 2 back at brushing.'],
        'Balls with ball-first contact and the divot depth you intended, out of 10, plus the switch balls that matched your call, out of 4. Total out of 14.', 14)),
      SH(GC('Tempo staircase',
        'A mid-iron and one target. A metronome app is helpful.',
        'Same club and target. Only the tempo changes.',
        ['3 balls at a slow tempo.', '3 balls at your normal tempo, then 3 at a quick tempo.', '2 balls back at normal.'],
        'Balls with ball-first contact, out of 11, plus the switch balls that matched your call, out of 4. Total out of 15. Note which tempo gave you the cleanest contact.', 15)),
      SH(GC('Weight staircase',
        'A mid-iron and one target. Judge your weight by feel in the lead foot.',
        'Same club and target. Only the pressure in your lead foot at impact changes.',
        ['3 balls with weight about even between your feet.', '3 balls with a bit more on the lead foot, then 3 with most of it on the lead foot.', '2 balls back at a bit more on the lead foot.'],
        'Balls with ball-first contact, out of 11, plus the switch balls that matched your call, out of 4. Total out of 15. Note which amount of pressure gave your cleanest contact.', 15)),
      GC('Fat and thin switch',
        'A mid-iron and a line on the turf or a divot board. Ball on or just ahead of the line. One target.',
        'Same club, target and ball position. Only the contact changes, and it switches on every ball.',
        ['6 balls switching between deliberately fat and deliberately thin, starting with fat.', '5 balls switching fat, clean, thin, clean, then repeating.', '4 balls with ball-first contact and the divot starting at or just ahead of the line.'],
        'Balls where the contact matched what you called or aimed for, out of 15.', 15),
      GC('Brush and dig switch',
        'A mid-iron and one target.',
        'Same club and target. Only the depth of the divot changes, and it switches on every ball.',
        ['6 balls switching between brushing the grass with almost no divot and taking a deep divot, starting with the brush.', '5 balls switching brush, medium, deep, medium, then repeating.', '4 balls with a shallow divot and ball-first contact.'],
        'Balls where the divot matched what you called or aimed for, out of 15.', 15)
    ],
    'Clubface direction': [
      GC('Start line spectrum',
        '{{Club}}, one target and an alignment stick on the ground pointing at it. Film from behind if you can.',
        'Same club and target. Only your intended start line changes.',
        ['2 balls starting well left of the target on purpose.', '2 balls starting well right of the target on purpose.', '1 ball starting just left, then 1 just right.', '5 balls switching left, right, left, right, left.', '4 balls starting dead on the target.'],
        'Balls that finished inside the window around the line you intended (' + T(10) + ' wide, ' + T(5) + ' either side), out of 15.', 15),
      GC('Curve spectrum',
        'A mid-iron and one target.',
        'Same club and target. Only the amount and direction of curve changes.',
        ['2 big draws, then 2 big fades.', '1 small draw, then 1 small fade.', '5 balls switching draw, fade, draw, fade, draw.', '4 balls aiming to start and finish on the target line.'],
        'Balls that curved the way you intended, out of 15. Note how the face felt for each shape.', 15),
      SH(GC('Gate narrowing',
        '{{Club}} and two tees set as a gate about 6 feet (2 yards) ahead of the ball, on the line to your target.',
        'Same club and target. Only the gate width changes.',
        ['2 balls through a gate about 3 feet (1 yard) wide.', '2 balls at 2.5 feet (0.8 yards), then 2 at 2 feet (0.7 yards), 2 at 1.5 feet (0.5 yards) and 2 at 1 foot (0.3 yards).'],
        'Balls through the gate, out of 10, plus the switch balls that matched your call, out of 4. Total out of 14.', 14)),
      GC('Hook to slice spectrum',
        'A mid-iron, one target and plenty of room either side.',
        'Same club and target. Only the amount and direction of curve changes.',
        ['3 big hooks on purpose.', '3 big slices on purpose.', '5 balls switching hook and slice on every ball, starting with a hook.', '4 balls aiming to start and finish on the target line.'],
        'Balls that curved the way you intended, out of 15. Notice how much you had to change to go from one extreme to the other.', 15),
      SH(GC('Face feel ladder',
        '{{Club}}, one target and an alignment stick. Film if you can.',
        'Same club and target. Only the face you intend to present at impact changes (by feel).',
        ['2 balls with a very closed face feel, 2 with a slightly closed feel.', '1 ball with a neutral feel.', '2 balls with a slightly open feel, 2 with a very open feel.', '2 balls back at neutral, aiming at the target.'],
        'Balls that finished inside the window around the line you intended for that face feel (' + T(10) + ' wide, ' + T(5) + ' either side). Very closed: far left of the target, slightly closed: a little left, neutral: on the target, slightly open: a little right, very open: far right, for a right-handed golfer. Out of 11, plus the switch balls that matched your call, out of 4. Total out of 15.', 15)),
      SH(GC('Landing window shrink',
        '{{Club}} and one target. Markers to set the width of a landing window in yards.',
        'Same club and target. Only the width of the landing window changes.',
        ['2 balls into a window ' + T(40) + ' wide (' + T(20) + ' either side of the target).', '2 balls at ' + T(30) + ', then 2 at ' + T(20) + ', 2 at ' + T(15) + ' and 2 at ' + T(10) + '.'],
        'Balls landing inside the window, out of 10, plus the switch balls that matched your call, out of 4. Total out of 14.', 14)),
      SH(GC('Bias check and correct',
        '{{Club}} and one target. A notepad or phone to tally.',
        'Same club and target.',
        ['6 balls at the target with your normal intention, aiming for the shape you want (for example straight). Tally each ball: the shape you got (draw, straight or fade) and where it finished (left, centre or right).', 'Work out your bias: the shape or side you miss to most often.', '5 more balls with a small intended correction against your bias.'],
        'A ball scores 1 when it shows the shape you intended and finishes inside the window around the line you intended (' + T(10) + ' wide, ' + T(5) + ' either side). Out of 11 (compare the first 6 with the 5 correction balls), plus the switch balls that matched your call, out of 4. Total out of 15.', 15)),
      SH(GC('Face call before you look',
        '{{Club}} and one target.',
        'Same club and target for the whole game.',
        ['10 balls. After impact, and before the ball lands, call where it will finish: left of, on or right of the target.', 'Then watch the result and note whether your call was right.'],
        'Correct calls, out of 10, plus the switch balls that matched your call, out of 4. Total out of 14. Calibration is about knowing what the face did, not just hitting the target.', 14)),
      GC('Left and right switch',
        '{{Club}}, one target and an alignment stick. Film if you can.',
        'Same club and target. Only the start line changes, left or right of the same target, and it switches on every ball.',
        ['6 balls switching between starting the ball left of the target and right of it, about ' + T(10) + ' off the line each way, starting left.', '5 balls switching left, target, right, target, then repeating.', '4 balls starting on the target.'],
        'Balls that finished inside the window around the line you called (' + T(10) + ' wide, ' + T(5) + ' either side), out of 15.', 15),
      GC('Draw and fade switch',
        'A mid-iron and one target. Both shapes start from the target line: the draw curves left and the fade curves right.',
        'Same club and target. Only the shape changes, and it switches on every ball.',
        ['6 balls switching between a draw and a fade, starting with a draw.', '5 balls switching draw, straight, fade, straight, then repeating.', '4 balls aiming to start and finish on the target line.'],
        'Balls that showed the shape you called or aimed for, out of 15.', 15),
      GC('Shape and start line grid',
        '{{Club}} and one target. A notepad for a grid of three start lines (left, on target, right) by three shapes (draw, straight, fade).',
        'Same club and target. Only the start line and the shape change.',
        ['Work through the nine combinations in this order, one ball each: left-draw, left-straight, left-fade, target-draw, target-straight, target-fade, right-draw, right-straight, right-fade.', 'Repeat the first six combinations once more (15 balls in total).', 'Mark the combinations you found easiest and hardest.'],
        'Balls that showed the shape and finished inside the window around the line you intended (' + T(10) + ' wide, ' + T(5) + ' either side), out of 15.', 15),
      GC('Shape and line on call',
        '{{Club}}, one target and a die or random-number app. First roll picks the start line (1 or 2 = left, 3 or 4 = on target, 5 or 6 = right). Second roll picks the shape (1 or 2 = draw, 3 or 4 = straight, 5 or 6 = fade).',
        'Same club and target. Only the start line and the shape change, and they are called before every ball.',
        ['15 balls. Before each ball, roll for the start line and the shape, then play that combination.', 'If the combination matches the previous ball, roll again so it always switches.'],
        'Balls where the shape was right and the ball finished inside the window around the line you rolled (' + T(10) + ' wide, ' + T(5) + ' either side), out of 15.', 15)
    ]
  };

  // Switch blocks: club and target never change in calibration. Drills tagged shared get their category's
  // 4-ball block after their steps; its score is averaged with the drill's own score.
  const SWITCH = {
    'Face strike': '4 balls switching where you strike the face on every ball, never the same spot twice in a row. Call the spot before you hit, for example heel, toe, high, low. A ball struck where you called counts as a hit. Same club and target. Keep this block even if you have to shorten the earlier ones.',
    'Low point': '4 balls switching your contact on every ball in a pattern you call first, for example fat, clean, thin, clean. A ball with the contact you called counts as a hit. Same club and target. Keep this block even if you have to shorten the earlier ones.',
    'Clubface direction': '4 balls switching shot shape and start line on every ball, changing both from the ball before. For example: right start with a draw, left start with a fade, on target and straight, left start with a draw. A ball counts as a hit when it showed the shape you called and finished inside the window around the line you called (' + T(10) + ' wide). Same club and target. Keep this block even if you have to shorten the earlier ones.'
  };
  for (const cat of Object.keys(CAL)) {
    CAL[cat] = CAL[cat].map((g) => {
      if (!g.shared) return { name: g.name, how: g.how, balls: g.balls };
      const parts = g.how.split('\nScore: ');
      return { name: g.name, how: parts[0] + '\nSwitch: ' + SWITCH[cat] + '\nScore: ' + parts.slice(1).join('\nScore: '), balls: g.balls };
    });
  }

  // Transfer games: every game has a fixed number of balls, and your score is the number of balls that hit.
  const TRANSFER_BASE = [
    G('Range round, six holes',
      'Write six holes on a card. For each, pick a tee shot (driver or 3-wood to a landing window between two range markers) and an approach (a flag distance and a club). Use a different flag and club on every hole.',
      '12 balls: tee shot, then approach, for each hole. One ball per shot, no re-hits, full routine every ball. Play the holes in a random order you draw.',
      'Random hole order, and a different club and target on each shot, as on a real course.',
      'Shots finishing inside the window or on the flag, out of 12. Mark it passed at 8 or more.',
      'Course simulation', 12),
    G('Protect your points',
      'Choose four targets at different distances and four clubs. Start with 10 points.',
      '10 balls. Before every ball, draw the target and the club. Each ball that misses the target costs 1 point. Full routine every ball, no re-hits.',
      'Target and club both change on every ball, never the same club twice in a row.',
      'Balls on target, out of 10 (your points left equal your balls on target). Mark it passed at 6 or more.',
      'Pressure game', 10),
    G('Three targets, random order',
      'Choose three targets, each with a ' + T(20) + ' wide window, and three clubs. Write down a random order for hitting the targets, and change the order every round.',
      'Hit each target once, in the random order, with a different club each time. Missing any window means you start the round again. Maximum 15 balls.',
      'Target order is reshuffled after every round, and the club for each target changes each round.',
      '10 for a clean first round, minus 2 for each restart. 0 if you do not finish in 15 balls. The slider goes to 10. Mark it passed if you finish.',
      'Pressure game', 15, 10),
    G('Routine under pressure',
      'Four targets, four clubs and a phone timer. Decide your pre-shot routine and its length.',
      '8 balls with your full routine every ball. A ball hit without the full routine counts as a miss, and so does a ball that takes longer than 45 seconds from start of routine to contact.',
      'Random target, club and shape on every ball, drawn before the routine starts.',
      'Balls that finish inside the window, out of 8. Mark it passed at 6 or more.',
      'Pressure game', 8),
    G('Range Stableford',
      'Choose three targets. Size an outer window ' + T(20) + ' wide and an inner window ' + T(10) + ' wide.',
      '12 balls. Before every ball, draw the target and a club. Score 2 points for inside the inner window, 1 point for inside the outer window and 0 for a miss.',
      'Target and club change on every ball, never the same club twice in a row.',
      'Total points, out of 24 (the slider goes to 24). Mark it passed at 12 points or more.',
      'Scoring game', 12, 24),
    G('Clock pressure',
      'A phone timer set to 40 seconds per ball, three targets and three clubs.',
      '10 balls. Draw the target and the club, start the timer, and finish your routine and hit within the 40 seconds. A ball hit after the timer counts as a miss.',
      'Draw a new target and club for every ball, before the timer starts.',
      'Balls inside the window within the time, out of 10. Mark it passed at 6 or more.',
      'Pressure game', 10),
    G('Beat your number',
      'Choose your own target set and clubs. Look at your last score for this game and write down the number you need to beat.',
      '10 balls. Draw the target and the club for each ball, then play it with full routine and no re-hits. Count balls inside the window.',
      'Target and club change on every ball. Write the sequence down first so you cannot choose easy targets.',
      'Balls inside the window, out of 10. Mark it passed only if you beat your previous score.',
      'Scoring game', 10),
    G('Tee shot and approach pairs',
      'A landing window for driver or 3-wood, and a flag for approach shots. Five pairs.',
      '10 balls: five tee shots alternating with five approach shots, as one hole after another. Draw the approach club and distance for each pair. No re-hits.',
      'Alternate long and short clubs, with a new approach club, flag and shape each pair.',
      'Balls inside their window, out of 10. Mark it passed at 7 or more.',
      'Course simulation', 10),
    G('Infinity levels',
      'One driver, one mid-iron and one wedge, each with its own target on the range. Size each window for its club: ' + BY_CLUB(40) + '. Levels: level 1 is one shot with each club. Each new level adds one shot, in this order: another wedge, another iron, another driver, and so on.',
      'Hit the level in rotation (driver, iron, wedge, then repeat). You pass a level when every shot lands inside its window with no mistakes. You get three attempts at each level; if you fail all three, drop back a level. Play until your 10 minutes are up. Next time, start from the level you reached.',
      'Rotate between the clubs and never hit the same shot twice in a row.',
      'Levels passed in 10 minutes, doubled (maximum 10). The slider goes to 10. Mark it passed if you pass level 3 or higher.',
      'Scoring game', 12, 10),
    G('Perfection ladder',
      'A full set of clubs from wedge to driver and one target. Size the window for the club: ' + BY_CLUB(40) + ', and clubs in between in proportion to how far they go. After 6 balls, use three-quarters of each width.',
      '12 balls. Start with your wedge. If the ball lands inside the window, move up one club for the next ball; if it misses, move down one club. When you reach the end of the set, turn around.',
      'The club changes after every ball by design, because you always move up or down the set.',
      'Balls inside the window, out of 12. Mark it passed at 7 or more.',
      'Scoring game', 12),
    G('Two-ball test',
      'Two clubs and a target with a window ' + T(40) + ' wide. Windows to move to: ' + T(30) + ', ' + T(20) + ', ' + T(15) + ' and ' + T(10) + '.',
      'Hit two balls at the window, each with a different club. Two out of two: shrink the window one step. One out of two: stay the same. None: widen the window one step. Play until your 10 minutes are up.',
      'Use a different club for each of the two balls, and swap the two clubs for different ones every few rounds.',
      'Narrowest window reached: ' + T(40) + ' = 4, ' + T(30) + ' = 6, ' + T(20) + ' = 8, ' + T(15) + ' = 9, ' + T(10) + ' = 10 (0 if you ended wider than ' + T(40) + '). The slider goes to 10. Mark it passed at ' + T(30) + ' or narrower.',
      'Pressure game', 14, 10),
    G('Gambler',
      'Four clubs, three targets and a notepad. Window widths you can choose are ' + T(5) + ' to ' + T(40) + '.',
      '10 balls. Before every ball, draw the club and the target, then choose your window width before you hit. Landing inside the window earns points equal to its width in yards. A miss adds ' + N(50) + ' points. Lower is better.',
      'The club and target are drawn fresh for every ball, so you cannot settle on a favourite shot.',
      'Balls inside the window you chose, out of 10. Also add up your points to compare over time. Mark it passed at 6 or more.',
      'Pressure game', 10),
    G('Worst shot',
      'A target with a window ' + T(20) + ' wide, three clubs and a notepad.',
      '9 balls: three rounds of three balls, each ball with a different club. After each round, note how many yards your worst ball finished from the target.',
      'A different club for each of the three balls, and a new target for each round.',
      'Balls inside the window, out of 9. Mark it passed at 5 or more.',
      'Scoring game', 9),
    G('Danger side',
      'Work out which side you miss more often. Pick a flag, and set a window ' + T(10) + ' wide on the safe side of it. The danger side is the other side of the flag.',
      '10 balls. Full routine every ball, no re-hits. Count a hit when the ball lands inside the window, and note any ball that lands on the danger side.',
      'Draw a new club for every ball and change the flag after five balls.',
      'Balls inside the window, out of 10. Mark it passed at 5 or more with no balls on the danger side.',
      'Pressure game', 10),
    G('Wide or narrow',
      'Three targets, for example range poles or pairs of yardage markers: a driver target (about 250 yards) ' + Yd(20) + ' wide, and two 7-iron targets (about 150 yards), one wide at ' + Y(20) + ' and one narrow at ' + Y(10) + '. A scorecard for six par 4 holes.',
      '12 balls. Each hole: hit your driver at the driver target. If you hit it, play your 7-iron at the wide target; if you miss, play your 7-iron at the narrow target. Note the hole score: drive hit and approach hit = 3, drive hit and approach missed = 4, drive missed and approach hit = 4, both missed = 5.',
      'Driver and 7-iron alternate every shot, the targets change with the result of the drive, and you move to a new pair of markers every two holes.',
      'Balls that hit their target, out of 12. Mark it passed at 7 or more.',
      'Course simulation', 12),
    G('Weakest link, mixed',
      'Two targets and four clubs. A window ' + T(40) + ' wide. Windows to move to: ' + T(30) + ', ' + T(20) + ', ' + T(15) + ' and ' + T(10) + '.',
      'Count how many balls in a row land inside the window. Alternate between the two targets and change the club on every ball. A miss takes your count back to zero. When you reach five in a row, shrink the window one step. Play until your 10 minutes are up.',
      'Targets alternate and the club changes on every ball. This is a mixed version of a game normally played at one target.',
      'Narrowest window completed: ' + T(40) + ' = 4, ' + T(30) + ' = 6, ' + T(20) + ' = 8, ' + T(15) + ' = 9, ' + T(10) + ' = 10 (0 if none). The slider goes to 10. Mark it passed at ' + T(30) + ' or narrower.',
      'Pressure game', 15, 10)
  ];

  // Focus line added to every transfer game. Both coaches favour an external focus under pressure.
  const FOCUS = 'Focus: use your full routine on every ball and keep your attention on the target and the ball flight, not on body positions.';
  const ANCHOR = 'New move under pressure';
  TRANSFER_BASE.push(G(ANCHOR,
    'Use the mechanic from your latest technique protocol. Three targets with ' + T(20) + ' wide windows, three clubs and, if you can, your phone to film.',
    '12 balls. Before each ball, draw the target and the club. Take one smoothie rehearsal swing with the new move beside the ball, step in, then hit with your attention on the target. Film as many as you can.',
    'Target and club change on every ball, never the same club twice in a row.',
    'Balls where the new move showed up and the ball finished inside a ' + T(20) + ' window, out of 12. Mark it passed at 6 or more.',
    'Pattern transfer', 12));
  const TRANSFER = TRANSFER_BASE.map((g) => ({ name: g.name, cat: g.cat, balls: g.balls, pointsMax: g.pointsMax, how: g.how + '\n' + FOCUS }));

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
  const emptyData = () => ({ technique: [], protocols: [], mechanics: [], calibration: [], transfer: [], tempo: [] });

  const cleanItem = (i) => ({
    id: str(i.id, 64) || uid(),
    cat: str(i.cat, 40),
    name: str(i.name, 120),
    how: str(i.how, 1500),
    minutes: num(i.minutes, 0, 120),
    max: i.max == null ? null : Math.round(num(i.max, 1, 100)), // top of the score slider; null on older sessions scored out of 10
    unit: i.unit === 'points' ? 'points' : 'balls',
    dist: i.dist == null ? 150 : Math.round(num(i.dist, 30, 400)), // distance the window sizes are scaled to
    balls: i.balls == null ? null : Math.round(num(i.balls, 1, 100)), // balls played, used to weight a points game in the trends
    score: i.score == null ? null : Math.min(Math.round(num(i.score, 0, 100)), i.max == null ? 10 : Math.round(num(i.max, 1, 100))),
    passed: i.passed === true,
    notes: str(i.notes, 3000),
    stage: Math.round(num(i.stage, -1, 5)),
    rounds: Math.round(num(i.rounds, 0, 99))
  });

  // A session can cover several mechanics. Older records had one, kept as a one-item list.
  function cleanMechList(list, fallback) {
    const src = Array.isArray(list) ? list : (fallback ? [fallback] : []);
    const out = [];
    const seen = new Set();
    for (const m of src.slice(0, 10)) {
      const v = str(m, 200).trim();
      if (v && !seen.has(v.toLowerCase())) { seen.add(v.toLowerCase()); out.push(v); }
    }
    return out;
  }

  function cleanData(d) {
    const out = emptyData();
    if (!d || typeof d !== 'object') return out;
    for (const t of arr(d.technique)) {
      out.technique.push({
        id: str(t.id, 64) || uid(),
        date: isDate(t.date) ? t.date : today(),
        mechList: cleanMechList(t.mechList, str(t.mechanics, 200).trim()),
        mechanics: cleanMechList(t.mechList, str(t.mechanics, 200).trim()).join(', ').slice(0, 200),
        notes: str(t.notes, 3000),
        improve: str(t.improve, 3000)
      });
    }
    for (const r of arr(d.tempo)) {
      out.tempo.push({
        id: str(r.id, 64) || uid(),
        date: isDate(r.date) ? r.date : today(),
        ratio: r.ratio === '2:1' ? '2:1' : '3:1',
        bpm: Math.round(num(r.bpm, 20, 400)),
        notes: str(r.notes, 3000)
      });
    }
    const seenMech = new Set();
    (Array.isArray(d.mechanics) ? d.mechanics : []).slice(0, 100).forEach((m) => {
      const v = str(m, 200).trim();
      if (v && !seenMech.has(v.toLowerCase())) { seenMech.add(v.toLowerCase()); out.mechanics.push(v); }
    });
    for (const p of arr(d.protocols)) {
      out.protocols.push({
        id: str(p.id, 64) || uid(),
        date: isDate(p.date) ? p.date : today(),
        mechList: cleanMechList(p.mechList, str(p.mechanic, 200).trim()),
        mechanic: cleanMechList(p.mechList, str(p.mechanic, 200).trim()).join(', ').slice(0, 200),
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
  const freshUi = () => ({ tab: 'technique', mode: 'new', logFilter: 'all', tempo: { ratio: '3:1', bpm: 100, pause: 4, sound: true, ticks: false, sync: 0 }, conv: { dist: 150, width: 20 }, len: { technique: 30, calibration: 30, transfer: 30 } });
  let ui = freshUi();
  let drafts = freshDrafts();
  let tickHandle = null;
  let idleHandle = null;
  let writeChain = Promise.resolve();

  function freshDrafts() {
    return { technique: { id: null, date: today(), mechList: [], mechanics: '', notes: '', improve: '' }, protocol: freshProtocol(), calibration: null, transfer: null, tempo: freshTempo() };
  }
  function freshTempo() {
    const st = (typeof ui !== 'undefined' && ui && ui.tempo) || { ratio: '3:1', bpm: 100 };
    return { id: null, date: today(), ratio: st.ratio, bpm: st.bpm, notes: '' };
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
    stopTempo();
    stopTimerAudio();
    session = null;
    drafts = freshDrafts();
    ui = freshUi();
    renderLock();
  }

  function bump() {
    clearTimeout(idleHandle);
    if (!session) return;
    idleHandle = setTimeout(() => {
      if (tickHandle || tempoEngine.running) { bump(); return; } // a practice timer or the metronome is running, stay unlocked
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
    const total = session.data.technique.length + session.data.protocols.length + session.data.calibration.length + session.data.transfer.length + session.data.tempo.length;
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
      appIcon(),
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
      appIcon(),
      h('h1', { text: 'Golf practice log' }),
      h('p', { text: 'Enter your passphrase to open your log.' }),
      form);
    setTimeout(refresh, 0);
    return view;
  }

  /* ==========================================================
     App shell
     ========================================================== */
  const ICONS = {
    technique: ['M4 7h9', 'M17 7h3', 'M4 17h3', 'M11 17h9', 'M15 4.5v5', 'M9 14.5v5'],
    calibration: ['M12 3a9 9 0 1 0 0 18a9 9 0 0 0 0-18', 'M12 8a4 4 0 1 0 0 8a4 4 0 0 0 0-8', 'M12 2v3', 'M12 19v3', 'M2 12h3', 'M19 12h3'],
    transfer: ['M6 21V3.5', 'M6 4.5h12l-3 4l3 4H6'],
    trends: ['M3.5 20.5h17', 'M4.5 16l5-6l4 3.5l6-8'],
    log: ['M9 6h11', 'M9 12h11', 'M9 18h11', 'M4.2 6h.1', 'M4.2 12h.1', 'M4.2 18h.1'],
    tempo: ['M8.5 3.5h7l3 17h-13z', 'M12 16.5l3.5-9', 'M10.5 20.5h3']
  };
  const tabIcon = (id) => {
    const svg = s('svg', { viewBox: '0 0 24 24', 'aria-hidden': 'true', focusable: 'false' });
    (ICONS[id] || []).forEach((d) => svg.append(s('path', { d })));
    return svg;
  };
  // Each area has its own colour. A small tile (white icon on a coloured square) marks it, as in Apple's Settings.
  const iconTile = (id) => h('span', { class: 'tile tile-' + id, 'aria-hidden': 'true' }, tabIcon(id));
  const pageTitle = (id, text) => h('div', { class: 'page-title' }, iconTile(id), h('h2', { text }));
  const sectionHead = (id, text) => h('div', { class: 'section-head' }, iconTile(id), h('h3', { text }));
  // Drill categories share the colours used for the chart lines: blue, orange, green, and purple for technique.
  const CAT_CLASS = {
    'Face strike': 'cat-blue', 'Low point': 'cat-orange', 'Clubface direction': 'cat-green',
    'Course simulation': 'cat-blue', 'Pressure game': 'cat-orange', 'Scoring game': 'cat-green', 'Pattern transfer': 'cat-purple',
    Diagnose: 'cat-purple', Refine: 'cat-purple'
  };
  const catClass = (cat) => CAT_CLASS[cat] || (/^Stage \d of 5$/.test(cat || '') ? 'cat-purple' : '');

  // App icon for the lock screen: a golf flag on a rounded square.
  function appIcon() {
    return s('svg', { viewBox: '0 0 84 84', class: 'app-icon', role: 'img', 'aria-label': 'Golf practice log' },
      s('rect', { width: 84, height: 84, rx: 19 }),
      s('path', { d: 'M33 64V20' }),
      s('path', { class: 'flag', d: 'M33 21l24 9.5l-24 9.5z' }),
      s('path', { d: 'M22 64h24' }));
  }

  const TABS = [['technique', 'Technique'], ['calibration', 'Calibration'], ['transfer', 'Transfer'], ['tempo', 'Tempo'], ['trends', 'Practice trends'], ['log', 'Practice log']];

  // Fill the left part of each slider track, as iOS does. Runs after each render and whenever a slider moves.
  function paintRange(el) {
    const min = Number(el.min) || 0;
    const max = Number(el.max) || 100;
    el.style.setProperty('--p', (max > min ? ((Number(el.value) - min) / (max - min)) * 100 : 0) + '%');
  }
  function syncRanges() { document.querySelectorAll('input[type="range"]').forEach(paintRange); }
  document.addEventListener('input', (e) => { if (e.target && e.target.type === 'range') paintRange(e.target); });

  function renderApp(toTop) {
    clearTimer();
    stopTempo();
    if (!anyTimerRunning() && !timerAudio.ringing) stopTimerAudio();
    requestPersist();
    let view;
    if (ui.tab === 'settings') view = settingsView();
    else if (ui.tab === 'technique') view = techniqueView();
    else if (ui.tab === 'tempo') view = tempoView();
    else if (ui.tab === 'trends') view = trendsView();
    else if (ui.tab === 'log') view = logView();
    else view = sessionsView(ui.tab);

    const header = h('header', { class: 'top' },
      h('button', { type: 'button', class: 'bar-btn', text: 'Lock', onclick: lock }),
      h('h1', { text: 'Golf practice log' }),
      h('button', { type: 'button', class: 'bar-btn', text: 'Settings', onclick: () => { ui.tab = 'settings'; renderApp(true); } }));
    const nav = h('nav', { class: 'tabs', 'aria-label': 'Sections' },
      TABS.map(([id, label]) => h('button', {
        type: 'button', class: 'tab t-' + id,
        'aria-current': ui.tab === id ? 'page' : false,
        onclick: () => { ui.tab = id; renderApp(true); }
      }, tabIcon(id), h('span', { text: label }))));
    const reminder = backupDue() ? h('div', { class: 'stack reminder' },
      h('p', { class: 'banner', text: 'Your log lives only on this device. Back it up so clearing Safari history cannot erase it.' }),
      h('div', { class: 'actions' },
        h('button', { type: 'button', class: 'primary', text: 'Back up now', onclick: async () => { if (await exportBackup()) { toast('Backup saved'); renderApp(); } } }))) : null;
    root.replaceChildren(header, h('main', null, reminder, view), nav);
    syncRanges();
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
  /* Shared record bodies, used by each tab's History and by the Practice log. */
  const protocolMinutes = (rec) => rec.items.reduce((a, i) => a + i.minutes, 0);
  const para = (label, text) => (text ? h('div', null, h('strong', { text: label }), h('p', { class: 'notes', text })) : null);

  function logBody(rec) {
    return [para('Mechanics', rec.mechanics), para('How it went', rec.notes), para('Improve next time', rec.improve)];
  }
  function protocolBody(rec) {
    return [
      h('div', null, h('strong', { text: protocolMinutes(rec) + '-minute protocol' }), rec.target ? h('p', { class: 'notes', text: 'Target position: ' + rec.target }) : null),
      rec.items.map((it) => h('div', { class: 'hist-item' },
        h('strong', { text: it.name }),
        h('p', { class: 'tag', text: it.cat + ', ' + it.minutes + ' min' }),
        it.stage >= 0 && it.stage <= 4 ? h('p', { text: it.rounds + ' set' + (it.rounds === 1 ? '' : 's') + ' attempted, ' + (it.passed ? 'five in a row completed' : 'not completed') }) : null,
        it.notes ? h('p', { class: 'notes', text: it.notes }) : null)),
      para('How it went', rec.notes),
      para('Next session', rec.next)
    ];
  }
  // Show a drill's text as labelled lines (Setup, Steps, Score and so on) instead of one block.
  function howNodes(text) {
    return text.split('\n').filter(Boolean).map((line) => {
      const m = line.match(/^(Setup|Keep constant|Steps|Switch|Score|Play|Interleave|Focus):\s*(.*)$/);
      if (m) return h('p', { class: 'how-line' }, h('strong', { text: m[1] + ':' }), m[2] ? ' ' + m[2] : null);
      return h('p', { class: /^\d+\. /.test(line) ? 'how-line how-step' : 'how-line', text: line });
    });
  }
  const scoreText = (kind, it) => (it.score == null ? 'Not scored'
    : (it.max == null ? 'Score ' + it.score + ' / 10' : it.score + ' of ' + it.max + (it.unit === 'points' ? ' points' : ' balls'))
      + (kind === 'transfer' ? (it.passed ? ', passed' : ', not passed') : ''));
  function sessionBody(kind, rec) {
    const r = hitShare(rec.items);
    return [
      r ? h('p', { class: 'avg' }, h('strong', { text: 'Average score: ' + Math.round(r.pct) + '% of the maximum' }), ' (each drill is scored against its own maximum, then averaged)') : null,
      rec.items.map((it) => h('div', { class: 'hist-item' },
        h('strong', { text: it.name }),
        h('p', { class: 'tag', text: it.cat + ', ' + it.minutes + ' min' }),
        h('p', { text: scoreText(kind, it) }),
        it.notes ? h('p', { class: 'notes', text: it.notes }) : null))
    ];
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

  // Options for the mechanic dropdowns: the list kept in Settings, plus any mechanic already used in your history.
  function mechanicOptions() {
    const seen = new Set();
    const out = [];
    const add = (m) => {
      const v = (m || '').trim();
      if (v && !seen.has(mechKey(v))) { seen.add(mechKey(v)); out.push(v); }
    };
    session.data.mechanics.forEach(add);
    session.data.protocols.forEach((p) => p.mechList.forEach(add));
    session.data.technique.forEach((r) => r.mechList.forEach(add));
    return out;
  }
  // Tick one or more mechanics. The ticked names are kept in obj[key] as a list, in the same order as the options.
  function mechanicPicker(obj, key, onChange) {
    const opts = mechanicOptions();
    if (!Array.isArray(obj[key])) obj[key] = [];
    const summary = h('p', { class: 'hint' });
    const paint = () => { summary.textContent = obj[key].length ? 'Selected: ' + obj[key].join(', ') : 'None selected yet.'; };
    const box = h('div', { class: 'picker', role: 'group', 'aria-label': 'Mechanics' });
    opts.forEach((m) => {
      const cb = h('input', { type: 'checkbox' });
      cb.checked = obj[key].some((x) => mechKey(x) === mechKey(m));
      cb.addEventListener('change', () => {
        const next = cb.checked ? [...obj[key], m] : obj[key].filter((x) => mechKey(x) !== mechKey(m));
        obj[key] = opts.filter((o) => next.some((x) => mechKey(x) === mechKey(o)));
        paint();
        if (onChange) onChange();
      });
      box.append(h('label', { class: 'pick' }, cb, m));
    });
    if (!opts.length) box.append(h('p', { class: 'hint', text: 'No mechanics added yet.' }));
    paint();
    return h('div', null, box, summary);
  }
  const mechanicHint = () => (mechanicOptions().length ? null : h('p', { class: 'hint' },
    'Add the mechanics you work on in Settings first. ',
    h('button', { type: 'button', class: 'link', text: 'Open Settings', onclick: () => { ui.tab = 'settings'; renderApp(true); } })));

  function progressByMechanic() {
    const map = new Map();
    for (const p of session.data.protocols) {
      for (const name of (p.mechList.length ? p.mechList : [p.mechanic])) {
        const k = mechKey(name);
        if (!k) continue;
        let e = map.get(k);
        if (!e) { e = { name: name.trim(), furthest: -1, last: p.date, sessions: 0 }; map.set(k, e); }
        e.sessions += 1;
        if (p.date >= e.last) { e.last = p.date; e.name = name.trim(); }
        for (const it of p.items) if (it.stage >= 0 && it.stage <= 4 && it.passed) e.furthest = Math.max(e.furthest, it.stage);
      }
    }
    return [...map.values()].sort((a, b) => b.last.localeCompare(a.last));
  }
  function suggestedStart(mech) {
    const e = progressByMechanic().find((x) => mechKey(x.name) === mechKey(mech));
    return !e || e.furthest < 0 ? 0 : Math.min(4, e.furthest + 1);
  }
  // With several mechanics ticked, start at the stage of the one furthest behind.
  function suggestedStartMany(list) {
    return list.length ? Math.min(...list.map(suggestedStart)) : 0;
  }
  function freshProtocol() {
    return { id: null, date: today(), mechList: [], mechanic: '', target: '', start: 0, startTouched: false, items: [], notes: '', next: '', timer: { base: 0, startedAt: null } };
  }
  // Spread `total` minutes across blocks in proportion to the 30-minute plan, in whole minutes.
  function scaleMinutes(bases, total) {
    const sum = bases.reduce((a, b) => a + b, 0);
    const raw = bases.map((b) => (b * total) / sum);
    const out = raw.map(Math.floor);
    let rem = total - out.reduce((a, b) => a + b, 0);
    const order = raw.map((r, i) => [r - Math.floor(r), i]).sort((a, b) => b[0] - a[0]);
    for (let k = 0; rem > 0; k += 1, rem -= 1) out[order[k % order.length][1]] += 1;
    return out;
  }
  function buildProtocol(start, len) {
    const plan = PROTO_PLANS[start];
    const mins = scaleMinutes(plan.map((p) => p[1]), len || 30);
    return plan.map(([st], idx) => {
      const minutes = mins[idx];
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
      const mins = p.items.reduce((a, it) => a + it.minutes, 0);
      for (const name of (p.mechList.length ? p.mechList : [p.mechanic])) {
        const k = mechKey(name);
        if (!k) continue;
        let e = map.get(k);
        if (!e) { e = { name: name.trim(), minutes: 0, sessions: 0, last: p.date }; map.set(k, e); }
        e.minutes += mins; // a session on several mechanics adds its full time to each
        e.sessions += 1;
        if (p.date >= e.last) { e.last = p.date; e.name = name.trim(); }
      }
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

  // Share of balls that hit, for the items that pass `filter`. Older sessions scored out of 10 count as a share of 10.
  function hitShare(items, filter) {
    // Each drill is scored against its own maximum, then the drills are averaged, so pct is the average score as a percentage of the maximum.
    let hit = 0;
    let total = 0;
    let sum = 0;
    let n = 0;
    for (const it of items) {
      if (it.score == null || (filter && !filter(it))) continue;
      const top = it.max == null ? 10 : it.max;
      hit += it.score;
      total += top;
      sum += it.score / top;
      n += 1;
    }
    return n ? { hit, total, pct: (sum / n) * 100 } : null;
  }

  // Line chart of the average score as a percentage of the maximum (0 to 100) over your sessions, oldest to newest.
  function progressChart(dates, series, label) {
    const W = 320, H = 170, L = 30, R = 8, T = 8, B = 24;
    const x = (i) => L + (dates.length === 1 ? 0 : (i * (W - L - R)) / (dates.length - 1));
    const y = (v) => T + ((100 - v) * (H - T - B)) / 100;
    const svg = s('svg', { viewBox: '0 0 ' + W + ' ' + H, class: 'chart', role: 'img', 'aria-label': label });
    [0, 50, 100].forEach((v) => {
      svg.append(s('line', { x1: L, x2: W - R, y1: y(v), y2: y(v), class: 'grid' }),
        s('text', { x: L - 4, y: y(v) + 3, class: 'axis', 'text-anchor': 'end' }, v + '%'));
    });
    series.forEach((sr, si) => {
      const pts = sr.vals.map((v, i) => (v == null ? null : { x: x(i), y: y(v) })).filter(Boolean);
      const cls = sr.cls || 'l' + si;
      if (pts.length > 1) svg.append(s('polyline', { points: pts.map((q) => q.x.toFixed(1) + ',' + q.y.toFixed(1)).join(' '), class: 'line ' + cls }));
      pts.forEach((q) => svg.append(s('circle', { cx: q.x.toFixed(1), cy: q.y.toFixed(1), r: 3, class: 'pt ' + cls })));
    });
    svg.append(s('text', { x: L, y: H - 8, class: 'axis' }, shortDate(dates[0])),
      s('text', { x: W - R, y: H - 8, class: 'axis', 'text-anchor': 'end' }, shortDate(dates[dates.length - 1])));
    return svg;
  }

  // One trend block: chart plus a line per series with the latest and best hit rate.
  function trendBlock(areaId, title, sessions, seriesDefs, emptyText) {
    const sorted = [...sessions].sort((a, b) => a.date.localeCompare(b.date)).slice(-20);
    const series = seriesDefs.map((def) => {
      const vals = sorted.map((rec) => {
        const r = hitShare(rec.items, def.filter);
        return r ? r.pct : null;
      });
      return { name: def.name, cls: def.cls, vals };
    });
    const has = series.some((sr) => sr.vals.some((v) => v != null));
    if (!has) return h('div', { class: 'stack card' }, sectionHead(areaId, title), h('p', { class: 'empty', text: emptyText }));
    const rows = series.map((sr, si) => {
      const got = sr.vals.filter((v) => v != null);
      if (!got.length) return null;
      const latest = got[got.length - 1];
      const best = Math.max(...got);
      const avg = got.reduce((a, b) => a + b, 0) / got.length;
      return h('li', null, h('span', { class: 'swatch ' + (sr.cls || 'l' + si) }), sr.name + ': ' + Math.round(latest) + '% latest, ' + Math.round(best) + '% best, ' + Math.round(avg) + '% average');
    });
    return h('div', { class: 'stack card' },
      sectionHead(areaId, title),
      sorted.length > 1
        ? progressChart(sorted.map((r) => r.date), series, title + '. ' + series.map((sr) => sr.name + ' latest ' + Math.round(sr.vals.filter((v) => v != null).slice(-1)[0] || 0) + ' percent').join('. '))
        : h('p', { class: 'hint', text: 'Log two or more sessions to see a line over time.' }),
      h('ul', { class: 'legend' }, rows));
  }

  function trendsView() {
    const rows = techniqueHours();
    const total = rows.reduce((a, r) => a + r.hours, 0);
    const legend = [['rd', 'Under 10 hours'], ['am', '10 to 15 hours'], ['lg', '15 to 20 hours'], ['dg', 'Over 20 hours: Course Ready']];
    const hours = rows.length
      ? h('div', { class: 'stack card' },
        sectionHead('technique', 'Technique hours'),
        h('p', { class: 'lead', text: fmtH(total) + ' hours across ' + rows.length + ' technique change' + (rows.length === 1 ? '' : 's') + '.' }),
        h('ul', { class: 'legend' }, legend.map(([c, l]) => h('li', null, h('span', { class: 'swatch st-' + c }), l))),
        trackingChart(rows),
        h('p', { class: 'hint', text: 'Hours add up the full time of each saved protocol, and a session on several mechanics adds its full time to each. Quick logs do not add hours. Exactly 15 or 20 hours counts as light green.' }))
      : h('div', { class: 'stack card' }, sectionHead('technique', 'Technique hours'),
        h('p', { class: 'empty', text: 'No protocol sessions saved yet. Run a protocol under Technique and the hours for each technique change appear here.' }));

    const calSeries = [...Object.keys(CAL).map((c, i) => ({ name: c, cls: 'l' + i, filter: (it) => it.cat === c })), { name: 'All drills', cls: 'l3', filter: null }];
    return h('section', { class: 'stack' },
      pageTitle('trends', 'Practice trends'),
      hours,
      trendBlock('calibration', 'Calibration progress', session.data.calibration, calSeries, 'No calibration sessions scored yet. Your average score as a percentage of the maximum appears here for each category.'),
      trendBlock('transfer', 'Transfer progress', session.data.transfer, [
        { name: 'Course simulation', cls: 'l0', filter: (it) => it.cat === 'Course simulation' },
        { name: 'Pressure game', cls: 'l1', filter: (it) => it.cat === 'Pressure game' },
        { name: 'Scoring game', cls: 'l2', filter: (it) => it.cat === 'Scoring game' },
        { name: ANCHOR, cls: 'l4', filter: (it) => it.name === ANCHOR },
        { name: 'All games', cls: 'l3', filter: null }
      ], 'No transfer sessions scored yet. Your average score as a percentage of the maximum appears here, for each type of game.'),
      h('p', { class: 'hint', text: 'Calibration and transfer progress is your average score as a percentage of the maximum: each drill is scored against its own maximum (balls hit or points) and the drills in a session are averaged. Sessions scored out of 10 before ball counts count as a percentage of 10. A transfer line only has a point for sessions that included that type of game, so lines can skip some sessions.' }));
  }

  const lenText = (n) => (n === 60 ? '1 hour' : n + ' minutes');
  const lenWord = (n) => ({ 30: 'Thirty minutes', 40: 'Forty minutes', 50: 'Fifty minutes', 60: 'An hour' })[n] || n + ' minutes';
  const lenLabel = (n) => (n === 60 ? '1-hour' : n + '-minute');
  const NUMWORD = { 3: 'three', 4: 'four', 5: 'five', 6: 'six' };

  // Slider from 30 minutes to 1 hour in 10 minute steps. Changing it rebuilds an unsaved plan with more or fewer drills.
  function lengthControl(kind, onChange) {
    const out = h('output', { class: 'len-out', text: lenText(ui.len[kind]) });
    const range = h('input', { type: 'range', min: 30, max: 60, step: 10, 'aria-label': 'Session length' });
    range.value = String(ui.len[kind]);
    range.addEventListener('input', () => { out.textContent = lenText(Number(range.value)); });
    range.addEventListener('change', () => onChange(Number(range.value)));
    return h('div', { class: 'length' },
      h('div', { class: 'len-top' }, h('span', { class: 'lbl', text: 'Session length' }), out),
      range,
      h('div', { class: 'len-ticks', 'aria-hidden': 'true' }, ['30', '40', '50', '60'].map((x) => h('span', { text: x }))));
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
      pageTitle('technique', 'Technique practice'),
      modeBar([['new', 'Protocol'], ['log', 'Quick log'], ['history', 'History']]),
      showLength ? lengthControl('technique', setTechniqueLength) : null,
      body);
  }

  function protocolSetup(d) {
    const known = () => d.mechList.some((m) => progressByMechanic().some((e) => mechKey(e.name) === mechKey(m)));
    const sel = h('select', null, STAGE_NAMES.map((n, i) => h('option', { value: String(i), text: n })));
    sel.value = String(d.start);
    const hint = h('p', { class: 'hint' });
    function updateHint() {
      hint.textContent = known()
        ? 'Suggested start: ' + STAGE_NAMES[suggestedStartMany(d.mechList)] + ', based on your progress' + (d.mechList.length > 1 ? ' with the mechanic furthest behind' : '') + '. Change it to repeat an earlier stage.'
        : 'New mechanic, so the suggested start is No club.';
    }
    const mech = mechanicPicker(d, 'mechList', () => {
      d.mechanic = d.mechList.join(', ');
      if (!d.startTouched) { d.start = suggestedStartMany(d.mechList); sel.value = String(d.start); }
      updateHint();
    });
    sel.addEventListener('change', () => { d.start = Number(sel.value); d.startTouched = true; });
    updateHint();

    return h('div', { class: 'stack' },
      h('p', { class: 'lead', text: lenWord(ui.len.technique) + ' to change one mechanic. You move from no club to freezer swings, smoothie swings, a foam ball and then real balls, with five good swings in a row at each stage.' }),
      h('p', { class: 'hint', text: 'The goal is to change your pattern, not to hit good shots. Film yourself to check each swing hits the position. If one is wrong, start that set of five again.' }),
      progressBlock(),
      field('Date', dateInput(d)),
      field('Mechanics I am working on (tick one or more)', mech),
      mechanicHint(),
      field('Position I am aiming for', textInput(d, 'target', 500, 'For example: lead wrist flat at the top')),
      field('Start at', sel),
      hint,
      h('button', {
        type: 'button', class: 'primary', text: 'Generate ' + lenLabel(ui.len.technique) + ' protocol',
        onclick: () => {
          if (!d.mechList.length) { toast('Choose at least one mechanic'); return; }
          d.mechanic = d.mechList.join(', ');
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
    return h('li', { class: 'drill ' + catClass(item.cat) },
      h('div', { class: 'drill-head' },
        h('span', { class: 'idx', text: String(i + 1) }),
        h('h3', { text: item.name }),
        h('span', { class: 'tag', text: item.cat + ', ' + item.minutes + ' min' })),
      h('div', { class: 'how' }, howNodes(item.how)),
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
        mechList: d.mechList.slice(0, 10),
        mechanic: d.mechList.join(', ').slice(0, 200),
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
      h('p', { class: 'banner', text: (d.mechList.length > 1 ? 'Mechanics: ' : 'Mechanic: ') + d.mechList.join(', ') + (d.target ? '. Target position: ' + d.target : '') }),
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
      if (!d.mechList.length) { toast('Choose at least one mechanic'); return; }
      upsert(session.data.technique, {
        id: d.id || uid(),
        date: isDate(d.date) ? d.date : today(),
        mechList: d.mechList.slice(0, 10),
        mechanics: d.mechList.join(', ').slice(0, 200),
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
      field('Mechanics I worked on (tick one or more)', mechanicPicker(d, 'mechList')),
      mechanicHint(),
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
          logBody(rec),
          () => { drafts.technique = { ...rec }; ui.mode = 'log'; renderApp(true); },
          () => removeRecord('technique', rec.id)));
      } else {
        const fp = furthestPassed(rec);
        nodes.push(entryShell(
          [h('span', { class: 'd', text: fmtDate(rec.date) }), h('span', { class: 'sum', text: rec.mechanic + (fp >= 0 ? ', reached ' + STAGE_SHORT[fp] : '') })],
          protocolBody(rec),
          () => { drafts.protocol = { id: rec.id, date: rec.date, mechList: rec.mechList.slice(), mechanic: rec.mechanic, target: rec.target, start: 0, startTouched: true, items: rec.items.map((i) => ({ ...i })), notes: rec.notes, next: rec.next, timer: { base: 0, startedAt: null } }; ui.mode = 'new'; renderApp(true); },
          () => removeRecord('protocols', rec.id)));
      }
    });
    return h('div', { class: 'stack' }, nodes[0], h('div', { class: 'group' }, nodes.slice(1)));
  }

  /* ==========================================================
     Sections 2 and 3: timed sessions
     ========================================================== */
  const mkItem = (x, cat, minutes) => ({ id: uid(), cat, name: x.name, how: x.how, minutes, dist: 150, max: x.pointsMax || x.balls, unit: x.pointsMax ? 'points' : 'balls', balls: x.balls, score: null, passed: false, notes: '' });

  // Names of games used in your two most recent sessions, so a new plan avoids repeating them.
  function recentNames(kind) {
    return new Set([...session.data[kind]].sort(byDateDesc).slice(0, 2).flatMap((r) => r.items.map((i) => i.name)));
  }

  function genCalibration(len) {
    const n = Math.max(3, Math.round((len || 30) / CAL_BLOCK_MINUTES)); // 3 games for 30 minutes up to 6 for one hour
    const cats = Object.keys(CAL);
    const used = {};
    const counts = {};
    cats.forEach((c) => { used[c] = 0; counts[c] = 1; });
    session.data.calibration.forEach((r) => r.items.forEach((i) => { if (i.cat in used) used[i.cat] += 1; }));
    // Any extra games go to the category you have practised least so far.
    for (let e = n - cats.length; e > 0; e -= 1) {
      const c = cats.slice().sort((a, b) => (used[a] + counts[a]) - (used[b] + counts[b]))[0];
      counts[c] += 1;
    }
    const seen = recentNames('calibration');
    const out = [];
    for (const c of cats) {
      const fresh = CAL[c].filter((g) => !seen.has(g.name));
      shuffle(fresh.length >= counts[c] ? fresh : CAL[c]).slice(0, counts[c]).forEach((g) => out.push(mkItem(g, c, CAL_BLOCK_MINUTES)));
    }
    return out;
  }
  function genTransfer(len) {
    const n = Math.max(3, Math.round((len || 30) / TRANSFER_BLOCK_MINUTES)); // 3 games for 30 minutes up to 6 for one hour
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
      intro: (len) => lenWord(len) + ' of structured calibration: ' + NUMWORD[len / 10] + ' ten-minute games across face strike, low point and clubface direction. You never change club or target. Instead the part of the face you strike, your contact, your shot shape and your start line step through a fixed order and then switch from ball to ball. Every game is 15 balls or fewer, and your score is the number of balls that hit what the game asks for.'
    },
    transfer: {
      title: 'Transfer training', unit: 'test', gen: genTransfer,
      intro: (len) => lenWord(len) + ' of course-style games you can play at a driving range: ' + NUMWORD[len / 10] + ' ten-minute games drawn from seventeen. Targets and clubs change on every ball, you use your full routine, there is a consequence for a miss, and your attention stays on the target. The first game always tests the new move from your technique protocol under pressure. Your score is the number of balls that hit (Range Stableford, Three targets, Infinity levels, Two-ball test and Weakest link are scored in points instead), and you tick Passed when you reach the pass mark.'
    }
  };

  function sessionsView(kind) {
    const meta = META[kind];
    if (ui.mode === 'log') ui.mode = 'new';
    return h('section', null,
      pageTitle(kind, meta.title),
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
          type: 'button', class: 'primary', text: 'Generate ' + lenLabel(ui.len[kind]) + ' session',
          onclick: () => { const len = ui.len[kind]; drafts[kind] = { id: null, date: today(), items: meta.gen(len), timer: { base: 0, startedAt: null }, len }; renderApp(); }
        }));
    }
    return sessionForm(kind);
  }

  function itemCard(kind, item, i) {
    const total = item.max == null ? 10 : item.max; // older sessions were scored out of 10
    const points = item.unit === 'points';
    const unit = item.max == null ? ' / 10' : ' of ' + total + (points ? ' points' : ' balls');
    const out = h('output', { class: 'score-out', text: item.score == null ? 'Not scored' : item.score + unit });
    const range = h('input', { type: 'range', min: 0, max: total, step: 1, 'aria-label': (points ? 'Points scored in ' : 'Balls hit in ') + item.name });
    range.value = item.score == null ? 0 : item.score;
    range.addEventListener('input', () => { item.score = Number(range.value); out.textContent = item.score + unit; });

    const howEl = h('div', { class: 'how' }, howNodes(renderHow(item.how, item.dist)));
    let sizePicker = null;
    if (/\{\{(?:y|n):/.test(item.how)) {
      const sel = h('select', { 'aria-label': 'Club the window sizes are for in ' + item.name }, CLUBS.map(([label, d]) => h('option', { value: String(d), text: label })));
      sel.value = String(item.dist || 150);
      sel.addEventListener('change', () => { item.dist = Number(sel.value); howEl.replaceChildren(...howNodes(renderHow(item.how, item.dist))); });
      sizePicker = field('Name your club to size the windows', sel);
    }

    let passed = null;
    if (kind === 'transfer') {
      const cb = h('input', { type: 'checkbox' });
      cb.checked = !!item.passed;
      cb.addEventListener('change', () => { item.passed = cb.checked; });
      passed = h('label', { class: 'check' }, cb, 'Passed');
    }
    const notes = h('textarea', { rows: 2, maxlength: 3000, placeholder: 'Notes', 'aria-label': 'Notes for ' + item.name, value: item.notes });
    notes.addEventListener('input', () => { item.notes = notes.value; });

    return h('li', { class: 'drill ' + catClass(item.cat) },
      h('div', { class: 'drill-head' },
        h('span', { class: 'idx', text: String(i + 1) }),
        h('h3', { text: item.name }),
        h('span', { class: 'tag', text: item.cat + ', ' + item.minutes + ' min' })),
      howEl,
      sizePicker,
      h('div', { class: 'score-row' }, range, out),
      passed, notes);
  }

  function fmtClock(sec) {
    sec = Math.max(0, Math.ceil(sec));
    return String(Math.floor(sec / 60)).padStart(2, '0') + ':' + String(sec % 60).padStart(2, '0');
  }

  /* The session timer keeps running with the screen locked because a phone keeps playing audio when it locks.
     The app plays one audio track that is silent for the time left and then sounds an alarm, so the alarm
     does not depend on the page still running. It is played through the media volume, not the Clock app's alarm. */
  const ALARM_SECONDS = 30;
  const timerAudio = { el: null, url: null, endAt: 0, ringing: false, wake: null, ctl: null, onEnd: null };

  // Builds an 8-bit mono WAV: silence for `silentSec`, then `alarmSec` of beeping (three beeps, a pause, repeat).
  function buildTimerWav(silentSec, alarmSec) {
    const rate = 4000;
    const quiet = Math.round(Math.max(0, silentSec) * rate);
    const n = quiet + Math.round(alarmSec * rate);
    const buf = new ArrayBuffer(44 + n);
    const v = new DataView(buf);
    const text = (o, str) => { for (let i = 0; i < str.length; i++) v.setUint8(o + i, str.charCodeAt(i)); };
    text(0, 'RIFF'); v.setUint32(4, 36 + n, true); text(8, 'WAVE'); text(12, 'fmt ');
    v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
    v.setUint32(24, rate, true); v.setUint32(28, rate, true); v.setUint16(32, 1, true); v.setUint16(34, 8, true);
    text(36, 'data'); v.setUint32(40, n, true);
    const px = new Uint8Array(buf, 44, n);
    px.fill(128);
    for (let i = quiet; i < n; i++) {
      const sec = (i - quiet) / rate;
      const pos = sec % 1.5;
      const beep = Math.floor(pos / 0.3);
      if (beep < 3 && pos - beep * 0.3 < 0.2) {
        const f = beep % 2 === 0 ? 880 : 1175;
        px[i] = Math.round(128 + 112 * Math.sin(2 * Math.PI * f * sec));
      }
    }
    return buf;
  }
  function stopTimerAudio() {
    const a = timerAudio;
    if (a.el) { try { a.el.pause(); a.el.removeAttribute('src'); if (a.el.load) a.el.load(); } catch (e) { /* ignore */ } }
    if (a.url) { try { URL.revokeObjectURL(a.url); } catch (e) { /* ignore */ } }
    if (a.wake && a.wake.release) { try { a.wake.release(); } catch (e) { /* ignore */ } }
    a.el = null; a.url = null; a.wake = null; a.ringing = false;
    try {
      if (navigator.mediaSession) {
        navigator.mediaSession.metadata = null;
        ['pause', 'play', 'stop'].forEach((x) => { try { navigator.mediaSession.setActionHandler(x, null); } catch (e) { /* ignore */ } });
      }
    } catch (e) { /* ignore */ }
  }
  async function startTimerAudio(remainingSec) {
    stopTimerAudio();
    const a = timerAudio;
    try {
      try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) { /* ignore */ }
      a.url = URL.createObjectURL(new Blob([buildTimerWav(remainingSec, ALARM_SECONDS)], { type: 'audio/wav' }));
      a.el = new Audio();
      a.el.src = a.url;
      a.endAt = Date.now() + remainingSec * 1000;
      a.el.addEventListener('ended', () => { const done = a.onEnd; stopTimerAudio(); if (done) done(); });
      const p = a.el.play();
      if (p && p.catch) p.catch(() => { /* the on-screen timer still works */ });
      if (navigator.mediaSession && typeof MediaMetadata !== 'undefined') {
        navigator.mediaSession.metadata = new MediaMetadata({ title: 'Practice timer', artist: 'Golf practice log' });
        navigator.mediaSession.setActionHandler('pause', () => { if (a.ctl) a.ctl.pause(); });
        navigator.mediaSession.setActionHandler('stop', () => { if (a.ctl) a.ctl.dismiss(); });
      }
      if (navigator.wakeLock) a.wake = await navigator.wakeLock.request('screen');
    } catch (e) { /* audio is a bonus; the on-screen timer still works */ }
  }
  const anyTimerRunning = () => [drafts.protocol, drafts.calibration, drafts.transfer].some((d) => d && d.timer && d.timer.startedAt);

  function timerWidget(d, cards) {
    const t = d.timer;
    const total = d.items.reduce((a, i) => a + i.minutes * 60, 0);
    const clock = h('div', { class: 'clock', role: 'timer' });
    const nowLabel = h('p', { class: 'now-label' });
    const fills = [];
    const segs = d.items.map((it) => {
      const f = h('span', { class: 'fill' });
      fills.push(f);
      const seg = h('span', { class: 'tseg ' + catClass(it.cat) }, f);
      seg.style.flexGrow = String(it.minutes);
      return seg;
    });
    const toggle = h('button', { type: 'button', class: 'primary' });
    const reset = h('button', { type: 'button', class: 'ghost', text: 'Reset timer' });
    const stopAlarm = h('button', { type: 'button', class: 'danger', text: 'Stop alarm' });
    stopAlarm.hidden = !timerAudio.ringing;

    const elapsed = () => Math.min(total, t.base + (t.startedAt ? (Date.now() - t.startedAt) / 1000 : 0));

    function paint() {
      let e = elapsed();
      if (t.startedAt && e >= total) {
        t.base = total; t.startedAt = null; e = total;
        clearTimer();
        if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
        // the alarm is already part of the audio track; show the stop button while it is sounding
        if (timerAudio.el && (Date.now() - timerAudio.endAt) / 1000 < ALARM_SECONDS) { timerAudio.ringing = true; stopAlarm.hidden = false; }
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
      if (e >= total) nowLabel.textContent = timerAudio.ringing ? 'Time is up. The alarm is sounding.' : 'Time is up. Finish scoring below.';
      else if (t.startedAt) nowLabel.textContent = 'Now: ' + d.items[cur].name;
      else nowLabel.textContent = e > 0 ? 'Paused' : 'Press Start when you are ready.';
      toggle.textContent = timerAudio.ringing ? 'Stop alarm' : (t.startedAt ? 'Pause' : (e > 0 && e < total ? 'Resume' : 'Start'));
    }
    function startTick() { clearTimer(); tickHandle = setInterval(paint, 250); }

    const pauseTimer = () => { t.base = elapsed(); t.startedAt = null; clearTimer(); stopTimerAudio(); stopAlarm.hidden = true; paint(); };
    const dismissAlarm = () => { stopTimerAudio(); stopAlarm.hidden = true; paint(); };
    toggle.addEventListener('click', () => {
      if (timerAudio.ringing) { dismissAlarm(); return; }
      if (t.startedAt) { pauseTimer(); return; }
      if (t.base >= total) t.base = 0;
      t.startedAt = Date.now();
      startTick();
      startTimerAudio(total - t.base); // started from this tap so the phone allows it
      timerAudio.ctl = { pause: pauseTimer, dismiss: dismissAlarm };
      timerAudio.onEnd = () => { stopAlarm.hidden = true; paint(); };
      paint();
    });
    reset.addEventListener('click', () => { t.base = 0; t.startedAt = null; clearTimer(); stopTimerAudio(); stopAlarm.hidden = true; paint(); });
    stopAlarm.addEventListener('click', dismissAlarm);
    if (t.startedAt || timerAudio.ringing) { timerAudio.ctl = { pause: pauseTimer, dismiss: dismissAlarm }; timerAudio.onEnd = () => { stopAlarm.hidden = true; paint(); }; }

    if (t.startedAt) startTick();
    paint();
    return h('div', { class: 'card' }, clock, h('div', { class: 'timeline', 'aria-hidden': 'true' }, segs), nowLabel, h('div', { class: 'actions' }, toggle, reset, stopAlarm),
      h('p', { class: 'hint timer-note', text: 'Keeps running with the screen locked and sounds an alarm at the end, through your media volume.' }));
  }

  // At the range: slide the shot distance and the target width (in yards) to see how many fingers wide the target looks.
  // One finger is about 3.3 percent of the shot distance: 3.3 yards at 100, 5 at 150 and 6.6 at 200.
  function fingerCalc() {
    const c = ui.conv;
    const out = h('p', { class: 'conv-out', role: 'status' });
    const distOut = h('output', { class: 'len-out' });
    const widthOut = h('output', { class: 'len-out' });
    function update() {
      const f = Math.round(c.dist * 0.33) / 10; // yards per finger at this distance
      distOut.textContent = c.dist + ' yards';
      widthOut.textContent = Y(c.width);
      out.textContent = Y(c.width) + ' wide at ' + c.dist + ' yards is about ' + (c.width / f).toFixed(1) + ' fingers. 1 finger is about ' + Y(f) + ' at this distance.';
    }
    const dist = h('input', { type: 'range', min: 30, max: 300, step: 5, 'aria-label': 'Shot distance in yards' });
    dist.value = String(c.dist);
    dist.addEventListener('input', () => { c.dist = Number(dist.value); update(); });
    const width = h('input', { type: 'range', min: 1, max: 60, step: 1, 'aria-label': 'Target width in yards' });
    width.value = String(c.width);
    width.addEventListener('input', () => { c.width = Number(width.value); update(); });
    update();
    return h('details', { class: 'guide' },
      h('summary', { text: 'Yards to fingers (for the range)' }),
      h('div', { class: 'entry-body' },
        h('div', { class: 'len-top' }, h('span', { class: 'lbl', text: 'Shot distance' }), distOut),
        dist,
        h('div', { class: 'len-top' }, h('span', { class: 'lbl', text: 'Target width' }), widthOut),
        width,
        out,
        h('p', { class: 'hint', text: 'Drills with target sizes have a club picker (wedge about 100 yards, short iron 125, mid-iron 150, long iron or hybrid 200, driver 250) that scales the sizes. Set the distance you are hitting here, and hold your fingers up against the target to check a width.' })));
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
        items: d.items.map((i) => ({ id: i.id, cat: i.cat, name: i.name, how: i.how, minutes: i.minutes, max: i.max, unit: i.unit, balls: i.balls, dist: i.dist, score: i.score, passed: !!i.passed, notes: i.notes.trim() }))
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
      editing ? null : fingerCalc(),
      editing ? null : timerWidget(d, cards),
      h('ol', { class: 'drills' }, cards),
      h('div', { class: 'actions' },
        h('button', { type: 'button', class: 'primary', text: editing ? 'Save changes' : 'Save session', onclick: save }),
        editing ? null : h('button', { type: 'button', class: 'ghost', text: 'New plan', onclick: regenerate }),
        h('button', { type: 'button', class: 'ghost', text: editing ? 'Cancel edit' : 'Discard', onclick: discard })));
  }

  const itemMax = (it) => (it.max == null ? 10 : it.max);

  // Summary cell for a calibration or transfer session.
  function sessionSum(kind, rec) {
    return h('span', { class: 'sum', text: sessionSummary(kind, rec) });
  }

  function sessionSummary(kind, rec) {
    const r = hitShare(rec.items);
    if (!r) return 'No scores';
    const scored = rec.items.filter((i) => i.score != null);
    const pct = Math.round(r.pct) + '% of the maximum';
    let base;
    if (scored.every((i) => i.max == null)) base = 'Average ' + avgArr(scored.map((i) => i.score)).toFixed(1) + ' / 10, ' + pct;
    else if (scored.some((i) => i.unit === 'points')) base = pct;
    else base = r.hit + ' of ' + r.total + ' balls, ' + pct;
    const passed = rec.items.filter((i) => i.passed).length;
    return kind === 'transfer' ? base + ', ' + passed + ' of ' + rec.items.length + ' passed' : base;
  }

  function sessionHistory(kind) {
    const list = [...session.data[kind]].sort(byDateDesc);
    if (!list.length) return h('p', { class: 'empty', text: 'No sessions yet. Generate your first one under New session.' });
    const nodes = [];
    list.forEach((rec) => {
      nodes.push(entryShell(
        [h('span', { class: 'd', text: fmtDate(rec.date) }), sessionSum(kind, rec)],
        sessionBody(kind, rec),
        () => { drafts[kind] = { id: rec.id, date: rec.date, items: rec.items.map((i) => ({ ...i })), timer: { base: 0, startedAt: null } }; ui.mode = 'new'; renderApp(true); },
        () => removeRecord(kind, rec.id)));
    });
    return h('div', { class: 'group' }, nodes);
  }

  /* ==========================================================
     Tempo: a metronome with a dial, beat visuals and a log
     ========================================================== */
  const FPS = 30; // backswing and downswing are counted in frames of video at 30 per second
  const BPM_MIN = 40;
  const BPM_MAX = 300;
  // Backswing : downswing. Frames are backswing/downswing, slowest first. The speed is not limited to these.
  const TEMPO = {
    '3:1': { name: 'Long game', parts: 3, frames: [[27, 9], [24, 8], [21, 7], [18, 6]] },
    '2:1': { name: 'Short game', parts: 2, frames: [[20, 10], [18, 9], [16, 8], [14, 7]] }
  };
  const TONE_LOW = 587; // takeaway and top
  const TONE_PING = 1319; // impact
  const TONE_CLICK = 2400; // optional beat clicks
  const presetBpm = (down) => (60 * FPS) / down; // exact, e.g. 21/7 is 257.14 BPM

  // One beat of the metronome is one unit of the ratio. A 3:1 swing is 3 units back and 1 unit down.
  function tempoCycle(ratio, bpm, pauseSec) {
    const u = 60 / bpm;
    const back = TEMPO[ratio].parts * u;
    return { u, back, down: u, pause: pauseSec, total: back + u + pauseSec };
  }
  function presetMatch(ratio, bpm) {
    const downFrames = (60 / bpm) * FPS;
    const list = TEMPO[ratio].frames; // slowest first
    const slow = list[0][1];
    const fast = list[list.length - 1][1];
    const hit = list.find(([, d]) => Math.abs(downFrames - d) <= 0.3);
    if (hit) return 'Matches the ' + hit[0] + '/' + hit[1] + ' preset.';
    if (downFrames > slow) return 'Slower than the slowest preset (' + list[0][0] + '/' + slow + '), good for learning the feel.';
    if (downFrames < fast) return 'Faster than the fastest preset (' + list[list.length - 1][0] + '/' + fast + ').';
    return 'Between two presets.';
  }
  const tempoLabel = (rec) => rec.ratio + ' ' + TEMPO[rec.ratio].name.toLowerCase() + ' at ' + rec.bpm + ' BPM';

  const polar = (cx, cy, r, deg) => { const a = ((deg - 90) * Math.PI) / 180; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; };
  function arcPath(cx, cy, r, a0, a1) {
    const [x0, y0] = polar(cx, cy, r, a0);
    const [x1, y1] = polar(cx, cy, r, a1);
    return 'M' + x0.toFixed(2) + ' ' + y0.toFixed(2) + ' A' + r + ' ' + r + ' 0 ' + (a1 - a0 > 180 ? 1 : 0) + ' 1 ' + x1.toFixed(2) + ' ' + y1.toFixed(2);
  }

  // The metronome engine. Beeps are scheduled on the audio clock so the timing stays steady.
  const tempoEngine = { ctx: null, timer: null, raf: null, running: false, next: 0, queue: [], wake: null, viz: null };
  const tempoClock = () => (tempoEngine.ctx ? tempoEngine.ctx.currentTime : Date.now() / 1000);

  // On an iPhone the silent switch mutes Web Audio but not media playback. Setting the audio session to
  // playback (where supported) and keeping a silent media track playing makes the tones sound in silent mode.
  const silentMode = { el: null, url: null };
  function allowSilentModeAudio() {
    try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) { /* ignore */ }
    try {
      if (!silentMode.el) {
        silentMode.url = URL.createObjectURL(new Blob([buildTimerWav(1, 0)], { type: 'audio/wav' })); // 1 second of silence
        const el = new Audio();
        el.src = silentMode.url;
        el.loop = true;
        if (el.setAttribute) el.setAttribute('playsinline', '');
        silentMode.el = el;
      }
      const p = silentMode.el.play();
      if (p && p.catch) p.catch(() => { /* the tones still play where the phone is not on silent */ });
    } catch (e) { /* ignore */ }
  }
  function releaseSilentModeAudio() {
    if (silentMode.el) { try { silentMode.el.pause(); } catch (e) { /* ignore */ } }
  }

  function beep(ctx, when, freq, len, vol) {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, when);
    g.gain.exponentialRampToValueAtTime(vol, when + 0.003);
    g.gain.exponentialRampToValueAtTime(0.0001, when + len);
    o.connect(g);
    g.connect(ctx.destination);
    o.start(when);
    o.stop(when + len + 0.03);
  }
  function tempoSchedule() {
    const e = tempoEngine;
    const st = ui.tempo;
    while (e.next < tempoClock() + 0.25) {
      const c = tempoCycle(st.ratio, st.bpm, st.pause);
      const cyc = { start: e.next, ...c };
      if (st.sound && e.ctx) {
        beep(e.ctx, cyc.start, TONE_LOW, 0.08, 0.4); // takeaway: a low, subtle click
        beep(e.ctx, cyc.start + c.back, TONE_LOW, 0.08, 0.4); // top of the backswing, the start of the downswing: the same low click
        beep(e.ctx, cyc.start + c.back + c.down, TONE_PING, 0.3, 0.9); // impact: a higher, clear ping to aim the strike at
        if (st.ticks) { // an optional soft click on the beats inside the backswing, so the spacing can be counted
          const parts = TEMPO[st.ratio].parts;
          for (let i = 1; i < parts; i++) beep(e.ctx, cyc.start + i * c.u, TONE_CLICK, 0.02, 0.12);
        }
      }
      e.queue.push(cyc);
      if (e.queue.length > 6) e.queue.shift();
      e.next += c.total;
    }
  }
  function tempoPaint() {
    const e = tempoEngine;
    const v = e.viz;
    if (!v) return;
    // The audio clock runs ahead of what you hear by the device's output delay (more on Bluetooth), so hold the lights back by that much.
    const delay = e.ctx ? (e.ctx.baseLatency || 0) + (e.ctx.outputLatency || 0) : 0;
    const t = tempoClock() - delay - (ui.tempo.sync || 0) / 1000;
    const cyc = [...e.queue].reverse().find((c) => c.start <= t);
    const clamp = (x) => Math.min(1, Math.max(0, x));
    if (!cyc) {
      v.beats.forEach((b) => b.classList.remove('on'));
      v.cells.forEach((f) => { f.style.width = '0%'; });
      v.phase.textContent = 'Get ready';
      return;
    }
    const p = t - cyc.start;
    // One cell per beat, and each cell fills over exactly one beat, so the bar moves in time with the tones.
    const swingCells = v.cells.length - 1; // the last cell is the pause
    v.cells.forEach((f, i) => {
      const frac = i < swingCells ? (p - i * cyc.u) / cyc.u : (p - swingCells * cyc.u) / cyc.pause;
      f.style.width = (clamp(frac) * 100).toFixed(1) + '%';
    });
    v.beats[0].classList.toggle('on', p >= 0 && p < 0.2);
    v.beats[1].classList.toggle('on', p >= cyc.back && p < cyc.back + 0.2);
    v.beats[2].classList.toggle('on', p >= cyc.back + cyc.down && p < cyc.back + cyc.down + 0.25);
    v.phase.textContent = p < cyc.back ? 'Backswing' : p < cyc.back + cyc.down ? 'Downswing' : 'Rest';
  }
  function tempoFrame() {
    const e = tempoEngine;
    if (!e.running) return;
    tempoPaint();
    e.raf = requestAnimationFrame(tempoFrame);
  }
  async function startTempo() {
    const e = tempoEngine;
    if (e.running) return;
    allowSilentModeAudio(); // started from the tap, so the phone allows it
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC && !e.ctx) { try { e.ctx = new AC(); } catch (err) { e.ctx = null; } }
    if (e.ctx && e.ctx.resume) { try { await e.ctx.resume(); } catch (err) { /* keep going with visuals */ } }
    e.running = true;
    e.queue = [];
    e.next = tempoClock() + 0.2;
    tempoSchedule();
    e.timer = setInterval(tempoSchedule, 25);
    e.raf = requestAnimationFrame(tempoFrame);
    try { if (navigator.wakeLock) e.wake = await navigator.wakeLock.request('screen'); } catch (err) { e.wake = null; }
    if (e.viz) e.viz.toggle.textContent = 'Stop';
  }
  function stopTempo() {
    const e = tempoEngine;
    if (e.timer) clearInterval(e.timer);
    if (e.raf && typeof cancelAnimationFrame === 'function') cancelAnimationFrame(e.raf);
    e.timer = null;
    e.raf = null;
    e.running = false;
    e.queue = [];
    if (e.wake && e.wake.release) { try { e.wake.release(); } catch (err) { /* ignore */ } }
    e.wake = null;
    releaseSilentModeAudio();
    if (e.viz) {
      e.viz.beats.forEach((b) => b.classList.remove('on'));
      e.viz.cells.forEach((f) => { f.style.width = '0%'; });
      e.viz.phase.textContent = 'Stopped';
      e.viz.toggle.textContent = 'Start';
    }
  }
  document.addEventListener('visibilitychange', () => { if (document.hidden) stopTempo(); });

  function metronome() {
    const st = ui.tempo;
    const CX = 130; const CY = 130; const R = 90;
    const angleOf = (b) => -135 + ((b - BPM_MIN) / (BPM_MAX - BPM_MIN)) * 270;
    const bpmOf = (deg) => Math.round(BPM_MIN + ((Math.min(135, Math.max(-135, deg)) + 135) / 270) * (BPM_MAX - BPM_MIN));

    // dial
    const svg = s('svg', { viewBox: '-26 -2 312 264', class: 'dial', role: 'slider', tabindex: 0, 'aria-label': 'Tempo in beats per minute', 'aria-valuemin': BPM_MIN, 'aria-valuemax': BPM_MAX });
    const valueArc = s('path', { class: 'dial-value' });
    const ticks = s('g', null);
    const knob = s('circle', { class: 'dial-knob', r: 15 });
    const bpmText = s('text', { class: 'dial-bpm', x: CX, y: CY + 14 });
    svg.append(s('path', { class: 'dial-track', d: arcPath(CX, CY, R, -135, 135) }), valueArc, ticks, knob, bpmText, s('text', { class: 'dial-sub', x: CX, y: CY + 38 }, 'BPM'));

    const timeEl = h('p', { class: 'tempo-time' });
    const matchEl = h('p', { class: 'hint' });
    const chips = h('div', { class: 'chips', role: 'group', 'aria-label': 'Preset speeds' });
    const segBtns = [];

    function drawDial() {
      const a = angleOf(st.bpm);
      valueArc.setAttribute('d', arcPath(CX, CY, R, -135, Math.max(a, -134.5)));
      const [kx, ky] = polar(CX, CY, R, a);
      knob.setAttribute('cx', kx.toFixed(1));
      knob.setAttribute('cy', ky.toFixed(1));
      const shown = Math.round(st.bpm);
      bpmText.textContent = String(shown);
      svg.setAttribute('aria-valuenow', String(shown));
      svg.setAttribute('aria-valuetext', shown + ' beats per minute');
    }
    function drawTicks() {
      ticks.replaceChildren();
      TEMPO[st.ratio].frames.forEach(([tot, down]) => {
        const a = angleOf(presetBpm(down));
        const [x0, y0] = polar(CX, CY, R + 12, a);
        const [x1, y1] = polar(CX, CY, R + 22, a);
        const [tx, ty] = polar(CX, CY, R + 34, a);
        ticks.append(s('line', { class: 'dial-tick', x1: x0.toFixed(1), y1: y0.toFixed(1), x2: x1.toFixed(1), y2: y1.toFixed(1) }),
          s('text', { class: 'dial-tick-label', x: tx.toFixed(1), y: (ty + 3).toFixed(1) }, tot + '/' + down));
      });
    }
    function drawChips() {
      chips.replaceChildren(...TEMPO[st.ratio].frames.map(([tot, down]) => h('button', {
        type: 'button', class: 'chip', text: tot + '/' + down, 'aria-pressed': String(Math.abs(st.bpm - presetBpm(down)) < 0.01),
        onclick: () => setBpm(presetBpm(down), true)
      })));
    }
    function drawReadouts() {
      const c = tempoCycle(st.ratio, st.bpm, st.pause);
      timeEl.textContent = 'Backswing ' + c.back.toFixed(2) + ' s, downswing ' + c.down.toFixed(2) + ' s, whole swing ' + (c.back + c.down).toFixed(2) + ' s';
      matchEl.textContent = presetMatch(st.ratio, st.bpm);
    }
    function setBpm(b, exact) {
      const v = Math.min(BPM_MAX, Math.max(BPM_MIN, exact ? b : Math.round(b)));
      st.bpm = v;
      drawDial(); drawChips(); drawReadouts();
    }

    // dragging the dial
    let lastAngle = null;
    function fromPointer(e) {
      const r = svg.getBoundingClientRect();
      let deg = (Math.atan2(e.clientX - (r.left + r.width / 2), -(e.clientY - (r.top + r.height / 2))) * 180) / Math.PI;
      deg = Math.min(135, Math.max(-135, deg));
      if (lastAngle !== null && Math.abs(deg - lastAngle) > 200) return; // ignore a jump across the gap at the bottom
      lastAngle = deg;
      setBpm(bpmOf(deg));
    }
    svg.addEventListener('pointerdown', (e) => { lastAngle = null; if (svg.setPointerCapture) { try { svg.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ } } fromPointer(e); e.preventDefault(); });
    svg.addEventListener('pointermove', (e) => { if (e.buttons || e.pressure > 0) fromPointer(e); });
    svg.addEventListener('keydown', (e) => {
      const step = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1, PageUp: 10, PageDown: -10 }[e.key];
      if (step) { setBpm(Math.round(st.bpm) + step); e.preventDefault(); }
    });
    const nudge = (label, d) => h('button', { type: 'button', class: 'ghost', text: label, 'aria-label': (d > 0 ? 'Faster by ' : 'Slower by ') + Math.abs(d) + ' beats per minute', onclick: () => setBpm(Math.round(st.bpm) + d) });

    // ratio
    const setRatio = (r) => { st.ratio = r; segBtns.forEach(([id, b]) => b.setAttribute('aria-pressed', String(id === r))); drawTicks(); drawChips(); drawReadouts(); rebuildBar(); restartIfRunning(); };
    const ratioCtl = h('div', { class: 'seg-ctl', role: 'group', 'aria-label': 'Tempo ratio' },
      [['2:1', '2:1 Short game'], ['3:1', '3:1 Long game']].map(([id, label]) => {
        const b = h('button', { type: 'button', class: 'seg-btn', text: label, 'aria-pressed': String(st.ratio === id), onclick: () => setRatio(id) });
        segBtns.push([id, b]);
        return b;
      }));

    // beat visuals: three lights for the key moments, and a bar with one cell per beat
    const beatLabels = ['Takeaway', 'Top', 'Impact'];
    const beats = beatLabels.map(() => h('span', { class: 'beat', 'aria-hidden': 'true' }));
    const bar = h('div', { class: 'timeline tempo-bar', 'aria-hidden': 'true' });
    const phase = h('p', { class: 'now-label', role: 'status', text: 'Stopped' });
    function rebuildBar() {
      const parts = TEMPO[st.ratio].parts;
      const cells = [];
      const els = [];
      for (let i = 0; i < parts + 2; i++) {
        const f = h('span', { class: 'fill' });
        cells.push(f);
        els.push(h('span', { class: 'unit unit-' + (i < parts ? 'back' : i === parts ? 'down' : 'rest') }, f, i <= parts ? h('span', { class: 'unit-n', text: String(i + 1) }) : null));
      }
      bar.replaceChildren(...els);
      if (tempoEngine.viz) tempoEngine.viz.cells = cells;
    }
    // a change to the ratio or the rest starts the pattern again so the bar and the tones stay together
    const restartIfRunning = () => { if (tempoEngine.running) { stopTempo(); startTempo(); } };
    const toggle = h('button', { type: 'button', class: 'primary tempo-go', text: tempoEngine.running ? 'Stop' : 'Start', onclick: () => { if (tempoEngine.running) stopTempo(); else startTempo(); } });
    tempoEngine.viz = { beats, cells: [], phase, toggle };
    rebuildBar();

    // rest and sound
    const restSel = h('select', { 'aria-label': 'Pause between swings' }, [1, 2, 3, 4, 5, 6, 8].map((n) => h('option', { value: String(n), text: n + (n === 1 ? ' second' : ' seconds') })));
    restSel.value = String(st.pause);
    restSel.addEventListener('change', () => { st.pause = Number(restSel.value); drawReadouts(); restartIfRunning(); });
    const soundCb = h('input', { type: 'checkbox' });
    soundCb.checked = !!st.sound;
    soundCb.addEventListener('change', () => { st.sound = soundCb.checked; });
    const tickCb = h('input', { type: 'checkbox' });
    tickCb.checked = !!st.ticks;
    tickCb.addEventListener('change', () => { st.ticks = tickCb.checked; });
    const syncOut = h('output', { class: 'len-out', text: (st.sync || 0) + ' ms' });
    const syncRange = h('input', { type: 'range', min: 0, max: 300, step: 10, 'aria-label': 'Delay the lights in milliseconds' });
    syncRange.value = String(st.sync || 0);
    syncRange.addEventListener('input', () => { st.sync = Number(syncRange.value); syncOut.textContent = st.sync + ' ms'; });

    drawDial(); drawTicks(); drawChips(); drawReadouts();

    return h('div', { class: 'stack' },
      ratioCtl,
      h('div', { class: 'card' },
        h('div', { class: 'beats' }, beats.map((b, i) => h('div', { class: 'beat-col' }, b, h('span', { class: 'beat-label', text: beatLabels[i] })))),
        bar,
        phase,
        toggle),
      h('div', { class: 'card tempo-card' }, svg,
        h('div', { class: 'actions nudges' }, nudge('\u22125', -5), nudge('\u22121', -1), nudge('+1', 1), nudge('+5', 5)),
        timeEl, matchEl),
      h('div', { class: 'card' },
        h('strong', { text: 'Preset speeds' }),
        h('p', { class: 'hint', text: 'Tap one to jump to it. Each is written backswing/downswing in frames of video at 30 frames per second, so 27/9 is 0.9 s back and 0.3 s down.' }),
        chips),
      h('div', { class: 'card stack' },
        field('Pause between swings', restSel),
        h('label', { class: 'check' }, soundCb, 'Sound on'),
        h('label', { class: 'check' }, tickCb, 'Soft click inside the backswing'),
        h('div', null,
          h('div', { class: 'len-top' }, h('span', { class: 'lbl', text: 'Delay the lights' }), syncOut),
          syncRange,
          h('p', { class: 'hint', text: 'If the lights come before you hear the tone, add a delay. Bluetooth speakers and headphones need more.' }))),
      h('button', {
        type: 'button', class: 'ghost',
        text: 'Log this session',
        onclick: () => { stopTempo(); drafts.tempo = { id: null, date: today(), ratio: st.ratio, bpm: st.bpm, notes: '' }; ui.mode = 'history'; renderApp(true); }
      }),
      h('p', { class: 'hint', text: 'Three tones mark the takeaway, the top of the backswing and impact. From takeaway to top is 2 beats for a short game swing or 3 beats for a full swing, and from top to impact is 1 beat. Turn the dial to any speed, including slower than the presets. The sound plays through your media volume, so the silent switch should not mute it.' }));
  }

  function tempoBody(rec) {
    const c = tempoCycle(rec.ratio, rec.bpm, 4);
    return [
      h('p', { text: tempoLabel(rec) }),
      h('p', { text: 'Backswing ' + c.back.toFixed(2) + ' s, downswing ' + c.down.toFixed(2) + ' s. ' + presetMatch(rec.ratio, rec.bpm) }),
      para('Notes', rec.notes)
    ];
  }

  function tempoLog() {
    const d = drafts.tempo;
    const ratioSel = h('select', { 'aria-label': 'Tempo ratio' }, [['3:1', '3:1 Long game'], ['2:1', '2:1 Short game']].map(([v, l]) => h('option', { value: v, text: l })));
    ratioSel.value = d.ratio;
    ratioSel.addEventListener('change', () => { d.ratio = ratioSel.value; });
    const bpmInput = h('input', { type: 'text', inputmode: 'numeric', maxlength: 3, 'aria-label': 'Beats per minute', value: String(d.bpm) });
    bpmInput.addEventListener('input', () => { d.bpm = Number(bpmInput.value.replace(/[^0-9]/g, '')); });
    async function save() {
      if (!Number.isFinite(d.bpm) || d.bpm < 20 || d.bpm > 400) { toast('Enter a speed from 20 to 400 BPM'); return; }
      upsert(session.data.tempo, { id: d.id || uid(), date: isDate(d.date) ? d.date : today(), ratio: d.ratio === '2:1' ? '2:1' : '3:1', bpm: Math.round(d.bpm), notes: d.notes.trim().slice(0, 3000) });
      await persist();
      drafts.tempo = freshTempo();
      renderApp(true);
      toast('Tempo session saved');
    }
    const list = [...session.data.tempo].sort(byDateDesc);
    return h('div', { class: 'stack' },
      d.id ? h('p', { class: 'banner', text: 'Editing an earlier tempo session' }) : null,
      field('Date', dateInput(d)),
      field('Tempo ratio', ratioSel),
      field('Speed (beats per minute)', bpmInput),
      field('Notes', textArea(d, 'notes', 4, 3000)),
      h('div', { class: 'actions' },
        h('button', { type: 'button', class: 'primary', text: d.id ? 'Save changes' : 'Save tempo session', onclick: save }),
        d.id ? h('button', { type: 'button', class: 'ghost', text: 'Cancel edit', onclick: () => { drafts.tempo = freshTempo(); renderApp(); } }) : null),
      list.length
        ? h('div', { class: 'group' }, list.map((rec) => entryShell(
          [h('span', { class: 'd', text: fmtDate(rec.date) }), h('span', { class: 'sum', text: rec.ratio + ' at ' + rec.bpm + ' BPM' })],
          tempoBody(rec),
          () => { drafts.tempo = { ...rec }; renderApp(true); },
          () => removeRecord('tempo', rec.id))))
        : h('p', { class: 'empty', text: 'No tempo sessions logged yet.' }));
  }

  function tempoView() {
    if (ui.mode === 'log') ui.mode = 'new';
    return h('section', null,
      pageTitle('tempo', 'Tempo'),
      modeBar([['new', 'Metronome'], ['history', 'Log']]),
      ui.mode === 'history' ? tempoLog() : metronome());
  }

  /* ==========================================================
     Practice log: every session, with its drills, notes and scores
     ========================================================== */
  function logView() {
    const f = ui.logFilter;
    const filters = [['all', 'All'], ['technique', 'Technique'], ['calibration', 'Calibration'], ['transfer', 'Transfer'], ['tempo', 'Tempo']];
    const entries = [];
    if (f === 'all' || f === 'technique') {
      session.data.protocols.forEach((rec) => entries.push({ type: 'protocol', rec }));
      session.data.technique.forEach((rec) => entries.push({ type: 'log', rec }));
    }
    if (f === 'all' || f === 'calibration') session.data.calibration.forEach((rec) => entries.push({ type: 'calibration', rec }));
    if (f === 'all' || f === 'transfer') session.data.transfer.forEach((rec) => entries.push({ type: 'transfer', rec }));
    if (f === 'all' || f === 'tempo') session.data.tempo.forEach((rec) => entries.push({ type: 'tempo', rec }));
    entries.sort((a, b) => b.rec.date.localeCompare(a.rec.date));

    const latest = (kind) => {
      const rec = [...session.data[kind]].sort(byDateDesc).find((r) => hitShare(r.items));
      return rec ? Math.round(hitShare(rec.items).pct) + '%' : null;
    };
    const lc = latest('calibration');
    const lt = latest('transfer');

    const nodes = entries.map(({ type, rec }) => {
      let tag; let sum; let body;
      if (type === 'log') { tag = 'Quick log'; sum = h('span', { class: 'sum', text: rec.mechanics }); body = logBody(rec); }
      else if (type === 'protocol') {
        const fp = furthestPassed(rec);
        tag = 'Technique protocol, ' + protocolMinutes(rec) + ' min';
        sum = h('span', { class: 'sum', text: rec.mechanic + (fp >= 0 ? ', reached ' + STAGE_SHORT[fp] : '') });
        body = protocolBody(rec);
      } else if (type === 'tempo') {
        tag = 'Tempo, ' + rec.ratio;
        sum = h('span', { class: 'sum', text: rec.bpm + ' BPM' });
        body = tempoBody(rec);
      } else {
        tag = (type === 'calibration' ? 'Calibration' : 'Transfer') + ', ' + protocolMinutes(rec) + ' min';
        sum = sessionSum(type, rec);
        body = sessionBody(type, rec);
      }
      return h('details', { class: 'entry' },
        h('summary', null, iconTile(type === 'calibration' || type === 'transfer' || type === 'tempo' ? type : 'technique'), h('span', { class: 'd' }, fmtDate(rec.date), h('br'), h('span', { class: 'tag', text: tag })), sum),
        h('div', { class: 'entry-body' }, body));
    });

    return h('section', { class: 'stack' },
      pageTitle('log', 'Practice log'),
      h('div', { class: 'seg-ctl', role: 'group', 'aria-label': 'Show' },
        filters.map(([id, label]) => h('button', {
          type: 'button', class: 'seg-btn', text: label, 'aria-pressed': String(f === id),
          onclick: () => { ui.logFilter = id; renderApp(); }
        }))),
      (lc || lt) ? h('p', { class: 'lead', text: 'Latest average score: ' + [lc ? 'calibration ' + lc : null, lt ? 'transfer ' + lt : null].filter(Boolean).join(', ') + ' of the maximum.' }) : null,
      h('p', { class: 'hint', text: 'Each calibration and transfer session shows its average score as a percentage of the maximum. Each drill is scored against its own maximum and the drills are averaged. See Practice trends for how it moves over time. To edit or delete a session, open it in the History of its own tab.' }),
      entries.length ? h('div', { class: 'group' }, nodes) : h('p', { class: 'empty', text: 'Nothing logged here yet. Sessions appear as you save them.' }));
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

    // Mechanic options
    const mechInput = h('input', { type: 'text', maxlength: 200, placeholder: 'For example: lead wrist flat at the top', 'aria-label': 'New mechanic' });
    const mechMsg = status();
    const mechList = h('ul', { class: 'mech-list' });
    function paintMechanics() {
      const list = session.data.mechanics;
      mechList.replaceChildren(...(list.length
        ? list.map((m) => h('li', null,
          h('span', { text: m }),
          h('button', {
            type: 'button', class: 'ghost', text: 'Remove', 'aria-label': 'Remove ' + m,
            onclick: async () => { session.data.mechanics = session.data.mechanics.filter((x) => x !== m); await persist(); paintMechanics(); }
          })))
        : [h('li', { class: 'empty', text: 'No mechanics added yet.' })]));
    }
    async function addMechanic() {
      mechMsg.className = 'msg';
      const v = mechInput.value.trim();
      if (!v) { mechMsg.textContent = 'Type a mechanic first.'; return; }
      if (session.data.mechanics.length >= 100) { mechMsg.textContent = 'You can keep up to 100 mechanics.'; return; }
      if (session.data.mechanics.some((m) => m.toLowerCase() === v.toLowerCase())) { mechMsg.textContent = 'That mechanic is already in the list.'; return; }
      session.data.mechanics.push(v);
      await persist();
      mechInput.value = '';
      mechMsg.className = 'msg ok';
      mechMsg.textContent = 'Added.';
      paintMechanics();
    }
    paintMechanics();

    return h('section', { class: 'stack' },
      h('h2', { text: 'Settings' }),
      h('div', { class: 'panel' },
        h('h3', { text: 'Mechanic options' }),
        h('p', { text: 'These fill the Mechanic dropdown on the Technique tab, so every session is logged under the same name and your trends stay consistent. Removing an option does not change past sessions.' }),
        mechInput,
        h('div', { class: 'actions' }, h('button', { type: 'button', class: 'primary', text: 'Add mechanic', onclick: addMechanic })),
        mechMsg, mechList),
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
