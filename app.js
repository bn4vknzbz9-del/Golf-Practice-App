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
  const G = (name, setup, play, interleave, score, cat, balls, pointsMax, strokes) => ({
    name, cat, balls, pointsMax, strokes: strokes || null, // strokes: { base, par } when the score is a base number minus your shots
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


  /* Short game and putting: transfer-style games scored on the same slider. */
  const SG_FOCUS = 'Focus: full routine on every ball. Pick the landing spot first and keep your attention on it, not on body positions.';
  const PUTT_FOCUS = 'Focus: full routine on every putt. Decide the pace first and keep your attention on where the ball should stop.';
  const SHORTGAME_BASE = [
    G('Par 21',
      'Pick nine chips around a green: three easy, three medium and three hard. Easy is a clean lie with plenty of green to work with. Medium has a little less green, or some rough or a slope. Hard is a tight lie, a downhill lie, a bunker or short-sided. One ball, a hole (move it for different chips) and a scorecard.',
      'Play the nine chips one at a time. Chip the ball, then putt it out before you move to the next chip. Count every shot, chips and putts. No re-hits, full routine every shot. Par for the nine is 21.',
      'Mix the easy, medium and hard chips in a random order you draw, and change the club and landing spot from chip to chip.',
      'Points are 30 minus your total shots, so 21 shots (par) is 9 points, 20 shots is 10 and 18 shots or fewer is the maximum of 12. Mark it passed at par or better, 9 or more.',
      'Course simulation', 9, 12, { base: 30, par: 21 }),
    G('Up and down for pars, nine lies',
      'Nine different lies around the green: fairway, fringe, rough, a downhill lie, an uphill lie, a tight lie, a bunker, short-sided and a long chip. One ball and one hole, any hole you like.',
      'Chip, pitch or splash from each lie, then putt out. An up and down is par. Full routine every shot, no re-hits.',
      'Lie, club and landing spot change on every ball, never the same club twice in a row.',
      'Up and downs, out of 9. Mark it passed at 5 or more.',
      'Course simulation', 9),
    G('Protect your points, three-foot circle',
      'One hole with a three-foot circle around it (use a rope, string or a ring of tees). Start with 10 points. Three or four lies and two or three clubs.',
      '10 balls. Before every ball, draw the lie and the club. Each ball that finishes outside the circle costs 1 point. Full routine every ball, no re-hits.',
      'Lie and club both change on every ball.',
      'Balls inside the circle, out of 10 (your points left equal your balls inside). Mark it passed at 6 or more.',
      'Pressure game', 10),
    G('Up and down streak',
      'Nine lies around the green written on cards, one hole and one ball.',
      'Draw a lie, play it, putt out. An up and down keeps your streak alive; a miss resets it to zero. Play 9 balls in total, never repeating a lie until the cards run out.',
      'Random lie and club on every ball.',
      'Your longest run of up and downs in a row, out of 9. Mark it passed at 3 or more.',
      'Pressure game', 9),
    G('Rings around the hole',
      'One hole with three rings around it at 3, 6 and 9 feet (tees or a rope). Four lies and two or three clubs.',
      '8 balls from lies you draw. Ball inside 3 feet = 3 points, inside 6 feet = 2 points, inside 9 feet = 1 point, outside = 0. Full routine every ball, no re-hits.',
      'Lie and club change every ball.',
      'Points, out of 24. Mark it passed at 12 or more.',
      'Scoring game', 8, 24),
    G('Landing spot',
      'A towel or a hoop on the green as the landing spot, and the hole beyond it. Three starting positions at 5, 10 and 15 yards from the spot.',
      '10 balls. Land the ball on the towel or in the hoop on the first bounce, from a start position you draw. Full routine every ball.',
      'Start position and club change every ball, so the carry and the roll change each time.',
      'Balls that land on the spot, out of 10. Mark it passed at 5 or more.',
      'Distance control', 10),
    G('Bunker nine',
      'A greenside bunker and one hole. Nine lies in the bunker or around its edge: clean, plugged, a downhill lie, an uphill lie, close to the lip and so on.',
      '9 balls, one from each lie, drawn at random. Ball out and on the green = 1 point; ball out and inside 6 feet = 2 points. Full routine every ball.',
      'Lie changes every ball, and so does the landing spot.',
      'Points, out of 18. Mark it passed at 10 or more.',
      'Scoring game', 9, 18),
    G('Short-sided',
      'Three short-sided spots (less than 5 yards of green) and one hole on the far side. Wedges of different lofts.',
      '9 balls, 3 from each spot, in a random order. The ball must stop on the green and inside 10 feet. Full routine every ball.',
      'Spot and club change every ball.',
      'Balls on the green and inside 10 feet, out of 9. Mark it passed at 5 or more.',
      'Pressure game', 9),
    G('Pitching ladder',
      'Targets at 20, 30, 40 and 50 yards. A circle around each target with a radius of 10 percent of its distance (2, 3, 4 and 5 yards).',
      '8 balls, 2 at each distance, in a random order you draw. Full routine every ball.',
      'Distance changes every ball, never the same distance twice in a row.',
      'Balls finishing inside their circle, out of 8. Mark it passed at 4 or more.',
      'Distance control', 8),
    G('One spot, three clubs',
      'One spot about 15 yards from the hole and three clubs, for example a lob wedge, a sand wedge and a 9 iron.',
      '9 balls, 3 with each club, in an order you draw. Note which club finishes closest more often.',
      'Club changes every ball.',
      'Balls finishing inside 6 feet, out of 9. Mark it passed at 4 or more.',
      'Distance control', 9),
    G('Chip it close, then hole it',
      'One hole, four lies around it and a coin under the putter for a five-footer.',
      '8 balls. Chip from a lie you draw, then putt the ball out. Holing the putt after a chip inside 6 feet scores 3 points, holing any other putt scores 1 point, and a miss scores 0.',
      'Lie and club change every ball.',
      'Points, out of 24. Mark it passed at 10 or more.',
      'Scoring game', 8, 24),
    G('Flop or run',
      'One hole, a lie with a little green to work with and a lie with lots of green, and two clubs: a lofted wedge and an 8 iron or 9 iron.',
      '8 balls. Draw the lie and decide, before the routine, whether to fly it or run it. Ball inside 6 feet = 1 point, holed = 3 points. Full routine every ball.',
      'Lie and the type of shot (fly or run) change every ball.',
      'Points, out of 24. Mark it passed at 8 or more.',
      'Scoring game', 8, 24)
  ];
  const SHORTGAME = SHORTGAME_BASE.map((g) => ({ name: g.name, cat: g.cat, balls: g.balls, pointsMax: g.pointsMax, strokes: g.strokes, how: g.how + '\n' + SG_FOCUS }));


  // Short game on a hitting mat with a launch monitor or simulator (a Foresight, for example). Every ball is hit from the same spot on
  // the mat, so nothing changes lie. Distance, club and trajectory change instead, and the simulator's carry, total distance, offline
  // and distance-to-target numbers do the scoring. There is no putting.
  const SIM_FOCUS = 'Focus: full routine on every ball. Pick the number first, then read the carry and offline from the simulator after the shot, not during it. Every ball is hit from the same spot on the mat.';
  const SIMGAMES_BASE = [
    G('Simulator nine',
      'Choose nine targets on the simulator: three short (25, 30 and 35 yards), three medium (45, 55 and 65 yards) and three long (75, 85 and 95 yards). Wedges and short irons. Use yards, and watch the carry and the distance to the target.',
      'Play each target once, in a random order you draw, one ball each. Full routine every ball, no re-hits. A shot counts if it finishes inside 20 feet of the target on the simulator.',
      'Target distance and club change on every ball, so you never hit two shots in a row at the same number.',
      'Shots inside 20 feet of the target, out of 9. Mark it passed at 5 or more.',
      'Course simulation', 9),
    G('Random numbers',
      'Write the distances 20 to 100 yards in steps of 5 on cards and shuffle them. Four wedges or short irons.',
      '12 balls. Draw a card for every ball, choose the club that fits, then hit it. The carry must be within 10 percent of the number, for example 5 yards either side of 50.',
      'A new distance on every ball, drawn before the routine starts.',
      'Balls with a carry inside the 10 percent window, out of 12. Mark it passed at 7 or more.',
      'Course simulation', 12),
    G('Wedge ladder',
      'Targets at 20, 30, 40, 50, 60, 70, 80 and 90 yards. One wedge or the club that fits each number.',
      'One ball at each target, in a random order you draw. The carry must be within 10 percent of the target: 2 yards at 20, 5 at 50 and 9 at 90.',
      'Target distance changes on every ball.',
      'Balls with a carry inside the window, out of 8. Mark it passed at 5 or more.',
      'Distance control', 8),
    G('Carry ladder, five lives',
      'Start with a 20-yard target. The targets go up in 10-yard steps: 20, 30, 40, 50, 60, 70, 80, 90 and 100 yards.',
      'Hit one ball at the current target. If the carry is within 10 percent, move up to the next target. If it is not, you lose a life and hit the same target again. You have five lives. Stop when you lose the fifth or reach 100 yards.',
      'The target changes after every good shot, and the club changes with the distance.',
      'Targets cleared, out of 9. Mark it passed at 6 or more.',
      'Distance control', 9),
    G('Proximity points',
      'Targets between 30 and 90 yards, drawn at random. Wedges and short irons.',
      '10 balls. A target and club are drawn for every ball. A ball finishing inside 10 feet of the target scores 3 points, inside 20 feet 2 points and inside 30 feet 1 point, using the distance to the target the simulator shows. Full routine every ball.',
      'Target distance and club change on every ball.',
      'Points, out of 30. Mark it passed at 14 or more.',
      'Scoring game', 10, 30),
    G('Tight window',
      'Start with 10 points. Targets between 30 and 80 yards, drawn at random.',
      '10 balls. Each ball that misses its window costs 1 point. The window is a carry within 5 percent of the target, for example 2 yards either side of 40, and no more than 3 yards offline. Full routine every ball.',
      'Target and club change on every ball.',
      'Balls inside the window, out of 10 (your points left equal your balls inside). Mark it passed at 6 or more.',
      'Pressure game', 10),
    G('Three clubs, one number',
      'One target carry, for example 40 yards, and three wedges: lob, sand and pitching.',
      '9 balls, 3 with each club, in an order you draw. Adjust the swing length so each club carries the same distance. The carry must be within 3 yards of the target.',
      'The club changes on every ball, never the same club twice in a row.',
      'Balls with a carry inside 3 yards of the target, out of 9. Mark it passed at 5 or more.',
      'Distance control', 9),
    G('Swing-length matrix',
      'One wedge and three swing lengths, for example hip high, chest high and full. First hit 3 balls at each length, one length at a time, and write down the average carry for each.',
      'Then 9 test balls, 3 at each swing length, in a random order you draw. Each ball must carry within 3 yards of the average you wrote for that swing length.',
      'Swing length changes on every test ball.',
      'Test balls with a carry inside 3 yards of their number, out of 9. Mark it passed at 5 or more.',
      'Distance control', 9),
    G('Total distance windows',
      'Chip-and-run shots with a 7, 8 or 9 iron. Total distance targets of 15, 25, 35, 45 and 55 yards, using the total distance the simulator shows (carry plus roll).',
      '10 balls, 2 at each distance, in a random order you draw. The total must be within 3 yards of the target. Full routine every ball.',
      'Target distance changes on every ball, and so does the club if you like.',
      'Balls inside the window, out of 10. Mark it passed at 6 or more.',
      'Distance control', 10),
    G('Trajectory pairs',
      'One target carry of 45 yards. Check the apex (peak height) on the simulator after every ball.',
      '10 balls, as 5 pairs: a low ball, then a high ball, both to the target. Both carries must be within 3 yards of the target and the high ball must peak higher than the low ball.',
      'Trajectory alternates low and high on every ball.',
      'Pairs that meet both rules, out of 5. Mark it passed at 3 or more.',
      'Distance control', 10, 5),
    G('Same numbers, again',
      'One target carry of 35 yards and two wedges. Hit 3 balls with each wedge and write down its average launch angle and spin rate from the simulator.',
      'Then 10 test balls, alternating the two wedges. A ball counts if its carry is within 3 yards of the target, its spin is within 10 percent of that wedge\'s average and its launch angle is within 2 degrees of that average.',
      'The wedge changes on every test ball.',
      'Balls that meet all three rules, out of 10. Mark it passed at 5 or more.',
      'Pressure game', 10)
  ];
  const SIMGAMES = SIMGAMES_BASE.map((g) => ({ name: g.name, cat: g.cat, balls: g.balls, pointsMax: g.pointsMax, strokes: g.strokes, how: g.how + '\n' + SIM_FOCUS }));

  // The putting drills are about distance control: speed matters more than line, so the target is how far the ball stops, in
  // gates and zones, not whether it drops.
  const PACE_LADDER = 'Essential pace ladder'; // first in every putting session
  const PUTTING_BASE = [
    G(PACE_LADDER,
      'Four ball marks one foot apart in a line behind the hole (A, B, C and D); the first is the target. Mark starting points 5, 10, 20 and 30 feet from the first mark. Four or more balls.',
      'Start at 5 feet. From 5 to 10 feet the ball must stop between marks A and B (1 foot deep), from 10 to 20 feet between A and C (2 feet), and from 20 to 30 feet between A and D (3 feet). Each good putt moves you back 6 inches. You have five lives and lose one for every putt that finishes outside the gate. If you lose all five, stop.',
      'Distance changes after every good putt, and you putt from the same spot only again after a miss.',
      'Good putts before you ran out of lives, out of 50 (50 means you reached 30 feet). Mark it passed at 30 or more, which is about 20 feet.',
      'Distance control', 50),
    G('Twenty-foot depth test',
      'A tee or coin 20 feet away on a flat part of the green. No hole matters. This test shows how deep your speed pattern is.',
      '10 balls to the spot, trying to stop each one on it. Look at the pattern: how many feet between your shortest and longest ball? Most golfers are three to six times deeper than they are wide.',
      'Use a different ball and a different roll each time, and take a full routine before every ball.',
      'Balls that finish within 1 foot of the spot, front or back, out of 10. Mark it passed at 6 or more.',
      'Distance control', 10),
    G('Two-foot circle',
      'A hole with a circle 2 feet from the hole in every direction (a rope or a ring of tees). Three starting points at 20, 25 and 30 feet, each with a different slope or break.',
      '9 balls, 3 from each distance, in a random order you draw. The goal is to stop the ball inside the circle, not to hole it. Full routine every putt.',
      'Distance and break change on every putt.',
      'Putts finishing inside the circle, out of 9. Mark it passed at 5 or more.',
      'Distance control', 9),
    G('Nine-hole putting course',
      'Nine holes on the practice green with putts of 15 to 50 feet. Each hole is par 2. Draw the order at random.',
      'One ball per hole, putt out and count every putt. Full routine every putt.',
      'Different length and break on every hole.',
      'Points are 27 minus your total putts, so all two-putts gives 9. The slider goes to 18. Mark it passed at 9 or more.',
      'Course simulation', 9, 18),
    G('Three-putt killer',
      'One hole and a start spot at 30 feet. Add a second at 40 feet and a third at 50 feet if there is room.',
      '9 balls, 3 from each distance, in a random order. Putt out each ball. A three-putt is a miss.',
      'Distance and break change on every ball.',
      'Balls that took 2 putts or fewer, out of 9. Mark it passed at 8 or more.',
      'Pressure game', 9),
    G('Six, six, twelve',
      'Three holes. At each, a 6-foot putt from two different angles and a 12-foot putt from a third angle.',
      '3 holes, 3 putts each. A made 6-footer counts as par and a made 12-footer is a birdie. Full routine every putt, no re-hits.',
      'Angle and break change on every putt.',
      'Points: 1 for each 6-footer made and 2 for each 12-footer made, out of 12. Mark it passed at 6 or more.',
      'Scoring game', 9, 12),
    G('Short putt streak',
      'One hole and a 4-foot putt from several angles around it.',
      'Hole as many 4-footers in a row as you can in 20 putts. A miss resets the streak. Full routine every putt, no re-hits.',
      'Angle changes on every putt, including uphill and downhill.',
      'Your longest streak of putts made, out of 20. Mark it passed at 8 or more.',
      'Pressure game', 20),
    G('Clock, six and nine feet',
      'Six balls around one hole at 3 feet, then six at 6 feet, like the numbers on a clock.',
      '12 putts, taken in a random order. Full routine every putt, no re-hits.',
      'Position changes every putt, so break and slope change each time.',
      'Putts made, out of 12. Mark it passed at 9 or more.',
      'Scoring game', 12),
    G('Back and forth lags',
      'Two holes about 40 feet apart on the practice green.',
      '8 putts, back and forth. Aim to stop the ball inside 3 feet of the hole, and never leave it short of the hole by more than 3 feet. Full routine every putt.',
      'Direction, slope and break change every putt.',
      'Putts that finish inside 3 feet, out of 8. Mark it passed at 5 or more.',
      'Distance control', 8),
    G('Speed under pressure',
      'A coin 15 feet away and a second coin 30 feet away, and a hole at each.',
      '8 putts, alternating the two distances. Hole the putt and you get 2 points; stop it inside 3 feet and you get 1; otherwise 0. If you three-putt, take 1 point away.',
      'Distance alternates every putt.',
      'Points, out of 16 (never below 0). Mark it passed at 8 or more.',
      'Pressure game', 8, 16)
  ];
  const PUTTING = PUTTING_BASE.map((g) => ({ name: g.name, cat: g.cat, balls: g.balls, pointsMax: g.pointsMax, how: g.how + '\n' + PUTT_FOCUS }));

  /* Technique protocol: no club -> freezer -> smoothie -> foam ball -> real ball.
     Progression from Dr Luke Benoit's 5x5 method. The Set your goal and Refine blocks follow
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
  const SET_BLOCK = { name: 'Set your goal', how: 'Diagnose first. Write down the mechanic and the exact position you want, film one baseline swing and compare it with that position. Pick a check you can judge on video or in a mirror. If the mechanic has several parts, work the pivot and transition first, then the arms and club. The goal of this session is to change your pattern, not to hit good shots, because trying to hit good shots at the same time splits your attention.' };
  const REFINE_BLOCK = { name: 'Refine on real balls', how: 'Keep the move and calibrate it. Hit 3 real balls with a little too much of the move, 3 with a little too little, then 3 with the amount you want. Finish with shots at a target, keeping your attention on the ball flight.' };

  // Minutes for each block, by starting stage (all total 30). Stage -1 is Set your goal, 5 is Refine.
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
  const emptyData = () => ({ technique: [], protocols: [], mechanics: [], calibration: [], transfer: [], shortgame: [], putting: [], rounds: [], tempo: [] });

  // Two blocks were renamed. Games saved under the earlier name, and any text that mentioned a person, are brought up to date.
  const renamed = (name) => (name === 'Set the target' ? 'Set your goal' : /^\w+ ladder, five lives$/.test(name) ? 'Essential pace ladder' : name);
  const scrubHow = (text) => text.replace(/ ?[^.\n]*Scott F\w+[^.\n]*\./g, '');
  const cleanItem = (i) => ({
    id: str(i.id, 64) || uid(),
    cat: str(i.cat, 40),
    name: renamed(str(i.name, 120)),
    how: scrubHow(str(i.how, 1500)),
    minutes: num(i.minutes, 0, 120),
    max: i.max == null ? null : Math.round(num(i.max, 1, 100)), // top of the score slider; null on older sessions scored out of 10
    unit: i.unit === 'points' ? 'points' : 'balls',
    dist: i.dist == null ? 150 : Math.round(num(i.dist, 30, 400)), // distance the window sizes are scaled to
    balls: i.balls == null ? null : Math.round(num(i.balls, 1, 100)), // balls played, used to weight a points game in the trends
    strokes: i.strokes && typeof i.strokes === 'object' ? { base: Math.round(num(i.strokes.base, 1, 200)), par: Math.round(num(i.strokes.par, 1, 200)) } : null, // a game scored as a base number minus your shots, such as Par 21
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
    for (const kind of ['calibration', 'transfer', 'shortgame', 'putting']) {
      for (const rec of arr(d[kind])) {
        out[kind].push({
          id: str(rec.id, 64) || uid(),
          date: isDate(rec.date) ? rec.date : today(),
          ...(kind === 'shortgame' ? { place: rec.place === 'sim' ? 'sim' : 'area' } : {}),
          items: arr(rec.items).slice(0, 20).map(cleanItem)
        });
      }
    }
    for (const r of arr(d.rounds)) {
      const holes = r.holes === 9 ? 9 : 18;
      const count = (v) => Math.round(num(v, 0, holes));
      out.rounds.push({
        id: str(r.id, 64) || uid(),
        date: isDate(r.date) ? r.date : today(),
        course: str(r.course, 120),
        tees: str(r.tees, 40),
        holes,
        score: Math.round(num(r.score, 9, 300)),
        par: Math.round(num(r.par, 18, 90)),
        threePutts: count(r.threePutts),
        parFiveBogeys: count(r.parFiveBogeys),
        doubles: count(r.doubles),
        missedGreens: count(r.missedGreens), // missed greens with a 9 iron or less
        doubleChips: count(r.doubleChips),
        driversOut: count(r.driversOut), // drivers not in play
        gir: count(r.gir),
        udMade: count(r.udMade),
        udChances: count(r.udChances),
        notes: str(r.notes, 3000)
      });
    }
    return out;
  }

  /* ==========================================================
     Session state (lives in memory only while unlocked)
     ========================================================== */
  let session = null; // { key, salt, iter, data }
  // How far the lights are held back to match the sound you hear, as set on this phone earlier. It is kept (outside the
  // encrypted log, since it is not personal) and still applied, but there is no longer a screen to change it.
  function loadSync() {
    try { const v = Number(localStorage.getItem('golfpractice.tempo.sync.v1')); return Number.isFinite(v) ? Math.min(600, Math.max(-100, Math.round(v))) : 0; } catch (e) { return 0; }
  }
  const freshUi = () => ({ tab: 'technique', mode: 'new', logFilter: 'all', place: 'area', t5: { level: loadT5Level(), win: 'last5' }, tempo: { ratio: '3:1', bpm: 100, rest: 4, sound: true, ticks: false, sync: loadSync() }, conv: { dist: 150, width: 20 }, len: { technique: 30, calibration: 30, transfer: 30, shortgame: 30, putting: 30 } });
  let ui = freshUi();
  let drafts = freshDrafts();
  let tickHandle = null;
  let idleHandle = null;
  let writeChain = Promise.resolve();

  function freshDrafts() {
    return { technique: { id: null, date: today(), mechList: [], mechanics: '', notes: '', improve: '' }, protocol: freshProtocol(), calibration: null, transfer: null, shortgame: null, putting: null, round: freshRound(), tempo: freshTempo() };
  }
  // A new round starts with the course, tees and par of your latest one.
  function freshRound() {
    const last = (typeof session !== 'undefined' && session && session.data && session.data.rounds) ? [...session.data.rounds].sort(byDateDesc)[0] : null;
    return { id: null, date: today(), course: last ? last.course : '', tees: last ? last.tees : '', holes: 18, score: '', par: last ? last.par : 72, threePutts: 0, parFiveBogeys: 0, doubles: 0, missedGreens: 0, doubleChips: 0, driversOut: 0, gir: 0, udMade: 0, udChances: 0, notes: '' };
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
    openText.clear();
    document.body.removeAttribute('data-area');
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
    tempo: ['M8.5 3.5h7l3 17h-13z', 'M12 16.5l3.5-9', 'M10.5 20.5h3'],
    shortgame: ['M3.5 19.5c2.5-9 9-12.5 14-3', 'M19 20.5V7.5', 'M19 8l3.5 1.8L19 11.6', 'M2.5 20.5h8'],
    putting: ['M3 19.5h18', 'M5 15.8a2.4 2.4 0 1 0 0.1 0', 'M16 19.5V6', 'M16 6.5l4 2-4 2'],
    tiger5: ['M12 3a9 9 0 1 0 0.01 0', 'M12 7.5a4.5 4.5 0 1 0 0.01 0', 'M12 11.9h0.2'],
    rounds: ['M6.5 4.5h11v16h-11z', 'M9.5 4.5v-1.5h5v1.5', 'M9.5 9.5h5', 'M9.5 13h5', 'M9.5 16.5h3']
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
    'Distance control': 'cat-green', Diagnose: 'cat-purple', Refine: 'cat-purple'
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

  const TABS = [['technique', 'Technique'], ['calibration', 'Calibration'], ['transfer', 'Transfer'], ['shortgame', 'Short game'], ['putting', 'Putting'], ['tempo', 'Tempo'], ['rounds', 'Rounds'], ['tiger5', 'Tiger 5'], ['trends', 'Practice trends'], ['log', 'Practice log']];

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
    else if (ui.tab === 'rounds') view = roundsView();
    else if (ui.tab === 'tiger5') view = tiger5View();
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
    if (['technique', 'calibration', 'transfer', 'shortgame', 'putting', 'tempo', 'rounds', 'tiger5'].includes(ui.tab)) document.body.setAttribute('data-area', ui.tab); // the accent colour follows the tab
    else document.body.removeAttribute('data-area');
    root.replaceChildren(header, h('main', null, reminder, view), nav);
    try { // the tab bar scrolls sideways, so bring the current tab into view
      const cur = nav.querySelector('[aria-current="page"]');
      if (cur) nav.scrollLeft = cur.offsetLeft - (nav.clientWidth - cur.offsetWidth) / 2;
    } catch (err) { /* ignore */ }
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
  // For a game scored as a base number minus your shots (Par 21), say how many shots that was and how it compares with par.
  function shotsNote(it) {
    if (!it.strokes || it.score == null) return '';
    const { base, par } = it.strokes;
    const shots = base - it.score;
    const diff = shots - par;
    const vs = diff === 0 ? 'par' : diff < 0 ? Math.abs(diff) + ' under par' : diff + ' over par';
    if (it.score === 0) return ' (' + base + ' shots or more, ' + (base - par) + ' or more over par)';
    if (it.score === it.max) return ' (' + shots + ' shots or fewer, ' + vs + ' or better)';
    return ' (' + shots + ' shots, ' + vs + ')';
  }
  const scoreText = (kind, it) => (it.score == null ? 'Not scored'
    : (it.max == null ? 'Score ' + it.score + ' / 10' : it.score + ' of ' + it.max + (it.unit === 'points' ? ' points' : ' balls'))
      + shotsNote(it) + (kind !== 'calibration' ? (it.passed ? ', passed' : ', not passed') : ''));
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

  // Editing a saved session. It opens in the same form used to record it, filled in with what was saved. `from` is where the edit
  // was started: the Practice log ('log') or null for a tab's own History. After saving or cancelling you go back to where you were.
  const DATA_KEY = { log: 'technique', protocol: 'protocols', calibration: 'calibration', transfer: 'transfer', shortgame: 'shortgame', putting: 'putting', round: 'rounds', tempo: 'tempo' };
  function startEdit(type, rec, from) {
    const returnTo = from || null;
    if (type === 'log') {
      drafts.technique = { ...rec, mechList: (rec.mechList || []).slice(), returnTo };
      ui.tab = 'technique'; ui.mode = 'log';
    } else if (type === 'protocol') {
      drafts.protocol = { id: rec.id, date: rec.date, mechList: rec.mechList.slice(), mechanic: rec.mechanic, target: rec.target, start: 0, startTouched: true, items: rec.items.map((i) => ({ ...i })), notes: rec.notes, next: rec.next, timer: { base: 0, startedAt: null }, returnTo };
      ui.tab = 'technique'; ui.mode = 'new';
    } else if (type === 'round') {
      drafts.round = { ...rec, returnTo };
      ui.tab = 'rounds'; ui.mode = 'new';
    } else if (type === 'calibration' || type === 'transfer' || type === 'shortgame' || type === 'putting') {
      drafts[type] = { id: rec.id, date: rec.date, items: rec.items.map((i) => ({ ...i })), timer: { base: 0, startedAt: null }, returnTo, place: rec.place };
      ui.tab = type; ui.mode = 'new';
    } else if (type === 'tempo') {
      drafts.tempo = { ...rec, returnTo };
      ui.tab = 'tempo'; ui.mode = 'history';
    }
    renderApp(true);
  }
  // After a save or a cancel: back to the Practice log if that is where the edit began, otherwise to the tab's History (if given).
  function leaveEdit(draft, historyMode) {
    if (draft && draft.returnTo) ui.tab = draft.returnTo;
    else if (historyMode) ui.mode = historyMode;
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
    const labels = [];
    opts.forEach((m) => {
      const cb = h('input', { type: 'checkbox' });
      cb.checked = obj[key].some((x) => mechKey(x) === mechKey(m));
      cb.addEventListener('change', () => {
        const next = cb.checked ? [...obj[key], m] : obj[key].filter((x) => mechKey(x) !== mechKey(m));
        obj[key] = opts.filter((o) => next.some((x) => mechKey(x) === mechKey(o)));
        paint();
        if (onChange) onChange();
      });
      const label = h('label', { class: 'pick' }, cb, m);
      labels.push(label);
      box.append(label);
    });
    if (!opts.length) box.append(h('p', { class: 'hint', text: 'No mechanics added yet.' }));
    // a long list shows its first 8 options and a button for the rest, so the page never needs a scrolling box inside it
    const SHOW = 8;
    let more = null;
    if (opts.length > SHOW + 2) {
      let all = false;
      more = h('button', { type: 'button', class: 'link picker-more' });
      const fold = () => {
        labels.forEach((l, i) => { l.hidden = !all && i >= SHOW; });
        more.textContent = all ? 'Show fewer mechanics' : 'Show all ' + opts.length + ' mechanics';
        more.setAttribute('aria-expanded', String(all));
      };
      more.addEventListener('click', () => { all = !all; fold(); });
      fold();
      box.append(more);
    }
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
    return h('div', { class: 'stack' }, h('h3', { class: 'sub', text: 'Practice Ladder Overview' }), h('div', { class: 'ladders' }, list.map((e) => h('div', { class: 'ladder' },
      h('div', { class: 'ladder-top' },
        h('strong', { text: e.name }),
        h('span', { class: 'tag', text: e.furthest < 0 ? 'No stage completed yet' : 'Furthest: ' + STAGE_NAMES[e.furthest] })),
      h('div', { class: 'pips', 'aria-hidden': 'true' }, STAGE_SHORT.map((n, i) => h('span', { class: 'pip' + (i <= e.furthest ? ' on' : ''), text: n })))))));
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
      trendBlock('shortgame', 'Short game progress', session.data.shortgame.filter((r) => r.place !== 'sim'), [
        { name: 'Course simulation', cls: 'l0', filter: (it) => it.cat === 'Course simulation' },
        { name: 'Pressure game', cls: 'l1', filter: (it) => it.cat === 'Pressure game' },
        { name: 'Scoring game', cls: 'l2', filter: (it) => it.cat === 'Scoring game' },
        { name: 'Distance control', cls: 'l4', filter: (it) => it.cat === 'Distance control' },
        { name: 'All games', cls: 'l3', filter: null }
      ], 'No short game sessions scored yet. Your average score as a percentage of the maximum appears here, for each type of game.'),
      session.data.shortgame.some((r) => r.place === 'sim')
        ? trendBlock('shortgame', 'Simulator short game progress', session.data.shortgame.filter((r) => r.place === 'sim'), [
          { name: 'Course simulation', cls: 'l0', filter: (it) => it.cat === 'Course simulation' },
          { name: 'Pressure game', cls: 'l1', filter: (it) => it.cat === 'Pressure game' },
          { name: 'Scoring game', cls: 'l2', filter: (it) => it.cat === 'Scoring game' },
          { name: 'Distance control', cls: 'l4', filter: (it) => it.cat === 'Distance control' },
          { name: 'All games', cls: 'l3', filter: null }
        ], 'No simulator sessions scored yet.')
        : null,
      trendBlock('putting', 'Putting progress', session.data.putting, [
        { name: 'Distance control', cls: 'l4', filter: (it) => it.cat === 'Distance control' },
        { name: 'Course simulation', cls: 'l0', filter: (it) => it.cat === 'Course simulation' },
        { name: 'Pressure game', cls: 'l1', filter: (it) => it.cat === 'Pressure game' },
        { name: 'Scoring game', cls: 'l2', filter: (it) => it.cat === 'Scoring game' },
        { name: 'All games', cls: 'l3', filter: null }
      ], 'No putting sessions scored yet. Your average score as a percentage of the maximum appears here, for each type of game.'),
      h('p', { class: 'hint', text: 'Calibration, transfer, short game and putting progress is your average score as a percentage of the maximum: each drill is scored against its own maximum (balls hit or points) and the drills in a session are averaged. Sessions scored out of 10 before ball counts count as a percentage of 10. A transfer line only has a point for sessions that included that type of game, so lines can skip some sessions.' }));
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
    if (d) drafts[kind] = { id: null, date: d.date, items: META[kind].gen(len), timer: { base: 0, startedAt: null }, len, place: d.place };
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

  // A piece of text that starts folded away behind a button. Which ones are open is remembered until you lock the app.
  const openText = new Set();
  function disclosure(key, showLabel, hideLabel, nodes, cls) {
    const box = h('div', { class: cls || 'fold' }, nodes);
    const btn = h('button', { type: 'button', class: 'link fold-btn' });
    const paint = () => {
      const open = openText.has(key);
      box.hidden = !open;
      btn.textContent = open ? hideLabel : showLabel;
      btn.setAttribute('aria-expanded', String(open));
    };
    btn.addEventListener('click', () => { if (openText.has(key)) openText.delete(key); else openText.add(key); paint(); });
    paint();
    return h('div', { class: 'fold-wrap' }, btn, box);
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
      disclosure('setup-intro', 'How this works', 'Hide how this works', [
        h('p', { class: 'lead', text: lenWord(ui.len.technique) + ' to change one mechanic. You move from no club to freezer swings, smoothie swings, a foam ball and then real balls, with five good swings in a row at each stage.' }),
        h('p', { class: 'hint', text: 'The goal is to change your pattern, not to hit good shots. Film yourself to check each swing hits the position. If one is wrong, start that set of five again.' })]),
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
      disclosure('how-' + item.id, 'Show instructions', 'Hide instructions', howNodes(item.how), 'how'),
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
      if (!d.mechList.length) { toast('Choose at least one mechanic'); return; }
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
      leaveEdit(d, 'history');
      drafts.protocol = freshProtocol();
      renderApp(true);
      toast(editing ? 'Changes saved' : 'Session saved');
    }
    function changeSetup() {
      if (d.items.some((i) => i.rounds > 0 || i.passed) && !window.confirm('Change the setup? Progress you logged will be lost.')) return;
      d.items = [];
      renderApp();
    }
    function discard() {
      if (!window.confirm(editing ? 'Discard your changes?' : 'Discard this session?')) return;
      leaveEdit(d);
      drafts.protocol = freshProtocol();
      renderApp(true);
    }
    return h('div', { class: 'stack' },
      editing ? h('p', { class: 'banner', text: 'Editing an earlier session' }) : null,
      editing ? null : h('p', { class: 'banner', text: (d.mechList.length > 1 ? 'Mechanics: ' : 'Mechanic: ') + d.mechList.join(', ') + (d.target ? '. Target position: ' + d.target : '') }),
      field('Date', dateInput(d)),
      editing ? field('Mechanics I worked on (tick one or more)', mechanicPicker(d, 'mechList', () => { d.mechanic = d.mechList.join(', '); })) : null,
      editing ? field('Position I was aiming for', textInput(d, 'target', 500, 'For example: lead wrist flat at the top')) : null,
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
      leaveEdit(d, 'history');
      drafts.technique = freshDrafts().technique;
      renderApp(true);
      toast(d.id ? 'Changes saved' : 'Entry saved');
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
        d.id ? h('button', { type: 'button', class: 'ghost', text: 'Cancel edit', onclick: () => { leaveEdit(d); drafts.technique = freshDrafts().technique; renderApp(true); } }) : null));
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
          () => startEdit('log', rec),
          () => removeRecord('technique', rec.id)));
      } else {
        const fp = furthestPassed(rec);
        nodes.push(entryShell(
          [h('span', { class: 'd', text: fmtDate(rec.date) }), h('span', { class: 'sum', text: rec.mechanic + (fp >= 0 ? ', reached ' + STAGE_SHORT[fp] : '') })],
          protocolBody(rec),
          () => startEdit('protocol', rec),
          () => removeRecord('protocols', rec.id)));
      }
    });
    return h('div', { class: 'stack' }, nodes[0], h('div', { class: 'group' }, nodes.slice(1)));
  }

  /* ==========================================================
     Sections 2 and 3: timed sessions
     ========================================================== */
  const mkItem = (x, cat, minutes) => ({ id: uid(), cat, name: x.name, how: x.how, minutes, dist: 150, max: x.pointsMax || x.balls, unit: x.pointsMax ? 'points' : 'balls', balls: x.balls, strokes: x.strokes || null, score: null, passed: false, notes: '' });

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

  // Short game and putting sessions: one game first, then others at random, avoiding the games you played in your last two sessions.
  // The short game starts with a course-style game such as Par 21. Putting always starts with the Essential pace ladder.
  function genFromPool(kind, pool, firstCat, len, firstName) {
    const n = Math.max(3, Math.round((len || 30) / TRANSFER_BLOCK_MINUTES));
    const seen = recentNames(kind);
    const fresh = (list) => { const f = list.filter((g) => !seen.has(g.name)); return f.length ? f : list; };
    const first = firstName ? pool.find((g) => g.name === firstName) : shuffle(fresh(pool.filter((g) => g.cat === firstCat)))[0];
    const rest = pool.filter((g) => g !== first);
    let others = rest.filter((g) => !seen.has(g.name));
    if (others.length < n - 1) others = rest;
    return [first, ...shuffle(others).slice(0, n - 1)].map((x) => mkItem(x, x.cat, TRANSFER_BLOCK_MINUTES));
  }
  const genShortGame = (len) => genFromPool('shortgame', ui.place === 'sim' ? SIMGAMES : SHORTGAME, 'Course simulation', len);
  const genPutting = (len) => genFromPool('putting', PUTTING, 'Distance control', len, PACE_LADDER);

  const META = {
    shortgame: {
      title: 'Short game practice', unit: 'game', gen: genShortGame,
      intro: (len) => ui.place === 'sim'
        ? lenWord(len) + ' of short game practice on a hitting mat with a launch monitor or simulator: ' + NUMWORD[len / 10] + ' ten-minute games drawn from eleven, always starting with a course-style game. Every ball is hit from the same spot, so distance, club and trajectory change instead of the lie, and the simulator\'s carry and distance-to-target numbers do the scoring. There is no putting. Scored on the same slider as transfer training.'
        : lenWord(len) + ' of short game practice scored on the same slider as transfer training: ' + NUMWORD[len / 10] + ' ten-minute games drawn from twelve, always starting with a course-style game such as Par 21. Lie, club and landing spot change on every ball, you use your full routine, and every game has a score and a pass mark.'
    },
    putting: {
      title: 'Putting practice', unit: 'game', gen: genPutting,
      intro: (len) => lenWord(len) + ' of putting practice scored on the same slider as transfer training: ' + NUMWORD[len / 10] + ' ten-minute games. Every session starts with the Essential pace ladder and the rest are drawn at random from the other nine. Speed matters more than line, so most games score where the ball stops. Distance and break change on every putt.'
    },
    calibration: {
      title: 'Calibration practice', unit: 'drill', gen: genCalibration,
      intro: (len) => lenWord(len) + ' of structured calibration: ' + NUMWORD[len / 10] + ' ten-minute games across face strike, low point and clubface direction. You never change club or target. Instead the part of the face you strike, your contact, your shot shape and your start line step through a fixed order and then switch from ball to ball. Every game is 15 balls or fewer, and your score is the number of balls that hit what the game asks for.'
    },
    transfer: {
      title: 'Transfer training', unit: 'test', gen: genTransfer,
      intro: (len) => lenWord(len) + ' of course-style games you can play at a driving range: ' + NUMWORD[len / 10] + ' ten-minute games drawn from seventeen. Targets and clubs change on every ball, you use your full routine, there is a consequence for a miss, and your attention stays on the target. The first game always tests the new move from your technique protocol under pressure. Your score is the number of balls that hit (Range Stableford, Three targets, Infinity levels, Two-ball test and Weakest link are scored in points instead), and you tick Passed when you reach the pass mark.'
    }
  };

  // Short game only: practise at the short game area, or on a mat with a simulator.
  function setPlace(place) {
    if (ui.place === place) return;
    const d = drafts.shortgame;
    if (d && !d.id && d.items.some((i) => i.score !== null) && !window.confirm('Switch? Scores you entered on this plan will be lost.')) { renderApp(); return; }
    ui.place = place;
    if (d && !d.id) { const len = d.len || ui.len.shortgame; drafts.shortgame = { id: null, date: d.date, items: META.shortgame.gen(len), timer: { base: 0, startedAt: null }, len, place }; }
    renderApp();
  }
  const placeToggle = () => h('div', { class: 'seg-ctl', role: 'group', 'aria-label': 'Where you are practising' },
    [['area', 'Short game area'], ['sim', 'Simulator']].map(([id, label]) => h('button', {
      type: 'button', class: 'seg-btn', text: label, 'aria-pressed': String(ui.place === id), onclick: () => setPlace(id)
    })));

  function sessionsView(kind) {
    const meta = META[kind];
    if (ui.mode === 'log') ui.mode = 'new';
    return h('section', null,
      pageTitle(kind, meta.title),
      modeBar('New session'),
      kind === 'shortgame' && ui.mode !== 'history' && !(drafts.shortgame && drafts.shortgame.id) ? placeToggle() : null,
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
          onclick: () => { const len = ui.len[kind]; drafts[kind] = { id: null, date: today(), items: meta.gen(len), timer: { base: 0, startedAt: null }, len, place: ui.place }; renderApp(); }
        }));
    }
    return sessionForm(kind);
  }

  function itemCard(kind, item, i) {
    const total = item.max == null ? 10 : item.max; // older sessions were scored out of 10
    const points = item.unit === 'points';
    const unit = item.max == null ? ' / 10' : ' of ' + total + (points ? ' points' : ' balls');
    const out = h('output', { class: 'score-out', text: item.score == null ? 'Not scored' : item.score + unit + shotsNote(item) });
    const range = h('input', { type: 'range', min: 0, max: total, step: 1, 'aria-label': (points ? 'Points scored in ' : 'Balls hit in ') + item.name });
    range.value = item.score == null ? 0 : item.score;
    range.addEventListener('input', () => { item.score = Number(range.value); out.textContent = item.score + unit + shotsNote(item); });

    const howEl = h('div', { class: 'how' }, howNodes(renderHow(item.how, item.dist)));
    let sizePicker = null;
    if (/\{\{(?:y|n):/.test(item.how)) {
      const sel = h('select', { 'aria-label': 'Club the window sizes are for in ' + item.name }, CLUBS.map(([label, d]) => h('option', { value: String(d), text: label })));
      sel.value = String(item.dist || 150);
      sel.addEventListener('change', () => { item.dist = Number(sel.value); howEl.replaceChildren(...howNodes(renderHow(item.how, item.dist))); });
      sizePicker = field('Name your club to size the windows', sel);
    }

    let passed = null;
    if (kind !== 'calibration') {
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
      h('div', { class: 'score-row' + (item.strokes ? ' has-shots' : '') }, range, out),
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
        ...(kind === 'shortgame' ? { place: d.place === 'sim' ? 'sim' : 'area' } : {}),
        items: d.items.map((i) => ({ id: i.id, cat: i.cat, name: i.name, how: i.how, minutes: i.minutes, max: i.max, unit: i.unit, balls: i.balls, dist: i.dist, score: i.score, passed: !!i.passed, notes: i.notes.trim() }))
      });
      await persist();
      leaveEdit(d, 'history');
      drafts[kind] = null;
      renderApp(true);
      toast(editing ? 'Changes saved' : 'Session saved');
    }
    function regenerate() {
      if (d.items.some((i) => i.score !== null) && !window.confirm('Replace this plan? Scores you entered will be lost.')) return;
      const len = d.len || ui.len[kind];
      drafts[kind] = { id: null, date: d.date, items: meta.gen(len), timer: { base: 0, startedAt: null }, len };
      renderApp();
    }
    function discard() {
      if (!window.confirm(editing ? 'Discard your changes?' : 'Discard this session?')) return;
      leaveEdit(d);
      drafts[kind] = null;
      renderApp(true);
    }

    return h('div', { class: 'stack' },
      editing ? h('p', { class: 'banner', text: 'Editing an earlier session' }) : null,
      field('Date', dateInput(d)),
      editing || kind === 'shortgame' || kind === 'putting' ? null : fingerCalc(), // the range calculator is for full shots
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
    return h('span', { class: 'sum', text: (rec.place === 'sim' ? 'Simulator, ' : '') + sessionSummary(kind, rec) });
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
    return kind !== 'calibration' ? base + ', ' + passed + ' of ' + rec.items.length + ' passed' : base;
  }

  function sessionHistory(kind) {
    const list = [...session.data[kind]].sort(byDateDesc);
    if (!list.length) return h('p', { class: 'empty', text: 'No sessions yet. Generate your first one under New session.' });
    const nodes = [];
    list.forEach((rec) => {
      nodes.push(entryShell(
        [h('span', { class: 'd', text: fmtDate(rec.date) }), sessionSum(kind, rec)],
        sessionBody(kind, rec),
        () => startEdit(kind, rec),
        () => removeRecord(kind, rec.id)));
    });
    return h('div', { class: 'group' }, nodes);
  }

  /* ==========================================================
     Tempo: a metronome with a dial, beat visuals and a log
     ========================================================== */
  const FPS = 30; // backswing and downswing are counted in frames of video at 30 per second
  const BPM_MIN = 80;
  const BPM_MAX = 300;
  // Backswing : downswing. Frames are backswing/downswing, slowest first. The speed is not limited to these.
  const TEMPO = {
    '3:1': { name: 'Long game', parts: 3, frames: [[39, 13], [36, 12], [33, 11], [30, 10], [27, 9], [24, 8], [21, 7], [18, 6]] },
    '2:1': { name: 'Short game', parts: 2, frames: [[20, 10], [18, 9], [16, 8], [14, 7]] }
  };
  const TONE_START = 587; // takeaway (D5)
  const TONE_TOP = 659; // top of the backswing, where the downswing starts (E5)
  const TONE_IMPACT = 740; // impact (F sharp 5)
  const TONE_CLICK = 2400; // optional beat clicks
  const presetBpm = (down) => (60 * FPS) / down; // exact, e.g. 21/7 is 257.14 BPM

  // The long game (3:1) follows the spacing of the reference tracks, measured from recordings of 21/7, 27/9 and 30/10:
  //  - the top of the backswing comes exactly 3 units after the takeaway (27 frames at 27/9, 21 frames at 21/7),
  //  - the impact tone comes a little later than one unit after the top (490 ms at 27/9, where one unit is 300 ms),
  //  - and the rest after impact is as long as the whole swing from takeaway to impact.
  // The extra time on the impact tone is fitted to the three recordings: 218.46 ms minus 262.55 ms divided by the downswing
  // frames. The fit is within 0.4 ms at those three speeds and is an estimate at the others.
  const TRACK_A = 0.21846; // seconds
  const TRACK_B = 0.26255; // seconds per frame
  // The cycle is a single line of numbered boxes, one per beat, ending in one small box for the rest. Each tone sounds exactly as its
  // box begins, the soft clicks sound on the other beats, and each box fills until the next one starts, so what you see, hear and
  // count always agree.
  function tempoCycle(ratio, bpm, rest) {
    const u = 60 / bpm; // one beat: the downswing of the ratio, e.g. 0.3 s at 27/9
    const parts = TEMPO[ratio].parts;
    const back = parts * u;
    let down; let pause; let starts; let toneBox; let track = false;
    if (ratio === '3:1') {
      track = true;
      down = u + Math.max(0, TRACK_A - TRACK_B / (u * FPS));
      pause = back + down;
      const g = (back + down) / 6; // the reference tracks tick 12 times around a swing and its rest
      starts = [0, g, 2 * g, 3 * g, back, 5 * g, 6 * g, 7 * g, 8 * g, 9 * g, 10 * g, 11 * g]; // the top of the backswing begins box 5
      toneBox = [0, 4, 6]; // takeaway on box 1, top on box 5, impact on box 7
    } else { // the short game keeps whole beats: 2 back, 1 down, then the rest in beats
      down = u;
      pause = rest * u;
      starts = Array.from({ length: parts + 1 + rest }, (_, i) => i * u);
      toneBox = [0, parts, parts + 1]; // takeaway on box 1, top on box 3, impact on box 4
    }
    const total = back + down + pause; // from one takeaway to the next
    const beats = starts.map((start, i) => ({
      start,
      end: i + 1 < starts.length ? starts[i + 1] : total,
      tone: toneBox.indexOf(i) >= 0 ? toneBox.indexOf(i) : null, // 0 takeaway, 1 top, 2 impact
      phase: i < toneBox[1] ? 'back' : i < toneBox[2] ? 'down' : i === toneBox[2] ? 'impact' : 'rest'
    }));
    // What is drawn: one numbered box for each beat up to and including the impact box, then a single small unnumbered box
    // that stands for the whole rest and fills slowly over it.
    const shown = beats.slice(0, toneBox[2] + 1);
    shown.push({ start: beats[toneBox[2] + 1].start, end: total, tone: null, phase: 'rest', collapsed: true });
    return { u, back, down, pause, track, beats, boxes: shown, total };
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
  const tempoEngine = { ctx: null, timer: null, raf: null, running: false, next: 0, queue: [], wake: null, viz: null, master: null, live: new Set(), gen: 0, starting: 0, stalledAt: 0, resuming: false, lastCt: 0, lastMove: 0 };
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
    g.connect(tempoEngine.master || ctx.destination); // every tone goes through one master volume so Stop can cut them all at once
    o.start(when);
    o.stop(when + len + 0.03);
    tempoEngine.live.add(o);
    o.onended = () => { tempoEngine.live.delete(o); };
  }
  // The time, on the audio clock, of the sound coming out of the speaker right now. Where the browser can report it,
  // this already includes the speaker or Bluetooth delay. Otherwise it is the clock minus what the browser says its delay is.
  const ctxRunning = (ctx) => !ctx.state || ctx.state === 'running'; // a browser that does not report a state is taken to be running
  function audibleTime() {
    const e = tempoEngine;
    if (!e.ctx) return Date.now() / 1000;
    // If the sound has been interrupted the clock is frozen, so do not carry on counting from the wall clock
    if (ctxRunning(e.ctx) && typeof e.ctx.getOutputTimestamp === 'function' && typeof performance !== 'undefined') {
      try {
        const ts = e.ctx.getOutputTimestamp();
        if (ts && ts.contextTime > 0 && ts.performanceTime > 0) return ts.contextTime + (performance.now() - ts.performanceTime) / 1000;
      } catch (err) { /* fall back below */ }
    }
    return e.ctx.currentTime - (e.ctx.baseLatency || 0) - (e.ctx.outputLatency || 0);
  }

  // Silence everything already scheduled: the tones for a whole swing are queued ahead of time.
  function cutSound() {
    const e = tempoEngine;
    if (e.master) {
      try { e.master.gain.cancelScheduledValues(0); e.master.gain.value = 0; } catch (err) { /* ignore */ }
      try { e.master.disconnect(); } catch (err) { /* ignore */ }
      e.master = null;
    }
    e.live.forEach((o) => { try { o.stop(); } catch (err) { /* ignore */ } try { o.disconnect(); } catch (err) { /* ignore */ } });
    e.live.clear();
  }
  function newMaster() {
    const e = tempoEngine;
    e.master = null;
    if (e.ctx && e.ctx.createGain) { try { e.master = e.ctx.createGain(); e.master.connect(e.ctx.destination); } catch (err) { e.master = null; } }
  }
  // The phone can interrupt the sound (a call, a notification, another app). The sound clock then stops, but the screen and the
  // wall clock carry on, which used to leave every box full and no sound. So watch the clock: try to restart the sound, begin the
  // pattern again cleanly if that works, and if the phone will not allow it, stop and say so.
  const STALL_MS = 1500;
  const nowMs = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());
  function watchAudio() {
    const e = tempoEngine;
    if (!e.running || !e.ctx) return;
    const now = nowMs();
    const ct = e.ctx.currentTime;
    if (ct !== e.lastCt) { e.lastCt = ct; e.lastMove = now; }
    if (ctxRunning(e.ctx) && now - e.lastMove < 400) {
      if (e.stalledAt) { e.stalledAt = 0; cutSound(); newMaster(); e.queue = []; e.next = tempoClock() + 0.2; } // it came back: begin the pattern again from now
      return;
    }
    if (!e.stalledAt) e.stalledAt = now;
    if (!e.resuming && e.ctx.resume) {
      e.resuming = true;
      try { Promise.resolve(e.ctx.resume()).catch(() => {}).then(() => { e.resuming = false; }); } catch (err) { e.resuming = false; }
    }
    if (now - e.stalledAt > STALL_MS) {
      stopTempo();
      toast('The sound was interrupted. Tap Start to begin again.');
    }
  }

  function tempoSchedule() {
    const e = tempoEngine;
    const st = ui.tempo;
    while (e.next < tempoClock() + 0.25) {
      const c = tempoCycle(st.ratio, st.bpm, st.rest);
      const cyc = { start: e.next, ...c };
      if (st.sound && e.ctx) {
        beep(e.ctx, cyc.start, TONE_START, 0.1, 0.45); // takeaway
        beep(e.ctx, cyc.start + c.back, TONE_TOP, 0.1, 0.5); // top of the backswing, where the downswing starts: a little higher
        beep(e.ctx, cyc.start + c.back + c.down, TONE_IMPACT, 0.3, 0.9); // impact: a little higher again, and longer and louder to aim the strike at
        if (st.ticks) c.beats.forEach((bx, i) => { if (i > 0 && bx.tone === null) beep(e.ctx, cyc.start + bx.start, TONE_CLICK, 0.02, 0.12); }); // an optional soft click on every beat that has no tone, through the rest as well
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
    // Draw the moment that is being heard now, adjusted by the sync set for this speaker or headphones.
    const t = audibleTime() - (ui.tempo.sync || 0) / 1000;
    const cyc = [...e.queue].reverse().find((c) => c.start <= t);
    const clamp = (x) => Math.min(1, Math.max(0, x));
    if (!cyc) {
      v.beats.forEach((b) => b.classList.remove('on'));
      v.cells.forEach((f) => { f.style.transform = 'scaleX(0)'; });
      v.phase.textContent = 'Get ready';
      return;
    }
    const p = t - cyc.start;
    // each box fills from the moment it begins until the next box begins, so the bar moves in time with the tones and the clicks
    v.cells.forEach((f, i) => { const bx = cyc.boxes[i]; if (!bx) return; f.style.transform = 'scaleX(' + clamp((p - bx.start) / (bx.end - bx.start)).toFixed(4) + ')'; });
    v.beats[0].classList.toggle('on', p >= 0 && p < 0.2);
    v.beats[1].classList.toggle('on', p >= cyc.back && p < cyc.back + 0.2);
    v.beats[2].classList.toggle('on', p >= cyc.back + cyc.down && p < cyc.back + cyc.down + 0.25);
    v.phase.textContent = p < cyc.back ? 'Backswing' : p < cyc.back + cyc.down ? 'Downswing' : 'Rest';
  }
  function tempoFrame() {
    const e = tempoEngine;
    if (!e.running) return;
    try { tempoPaint(); } catch (err) { /* one bad frame must not stop the animation */ }
    e.raf = requestAnimationFrame(tempoFrame);
  }
  async function startTempo() {
    const e = tempoEngine;
    if (e.running || e.starting === e.gen) return; // already running, or a start is already under way (a double tap)
    const gen = ++e.gen;
    e.starting = gen;
    const cancelled = () => gen !== e.gen; // Stop was pressed while the sound was still starting
    try {
      allowSilentModeAudio(); // started from the tap, so the phone allows it
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC && !e.ctx) { try { e.ctx = new AC(); } catch (err) { e.ctx = null; } }
      // a phone that has interrupted the sound can leave resume() waiting for ever, so give it a moment and then carry on:
      // the watch on the sound clock will stop with a message if the sound really is not running
      if (e.ctx && e.ctx.resume) { try { await Promise.race([e.ctx.resume(), new Promise((done) => setTimeout(done, 800))]); } catch (err) { /* keep going with visuals */ } }
      if (cancelled()) return;
      newMaster();
      e.running = true;
      e.queue = [];
      e.next = tempoClock() + 0.2;
      e.stalledAt = 0;
      e.resuming = false;
      e.lastCt = e.ctx ? e.ctx.currentTime : 0;
      e.lastMove = nowMs();
      if (e.viz) e.viz.toggle.textContent = 'Stop';
      tempoSchedule();
      e.timer = setInterval(() => { try { watchAudio(); if (e.running) tempoSchedule(); } catch (err) { /* keep ticking */ } }, 25);
      e.raf = requestAnimationFrame(tempoFrame);
      try {
        if (navigator.wakeLock) {
          const lock = await navigator.wakeLock.request('screen');
          if (cancelled()) { try { lock.release(); } catch (err) { /* ignore */ } } else e.wake = lock;
        }
      } catch (err) { e.wake = null; }
    } finally {
      if (e.starting === gen) e.starting = 0;
    }
  }
  function stopTempo() {
    const e = tempoEngine;
    if (e.timer) clearInterval(e.timer);
    if (e.raf && typeof cancelAnimationFrame === 'function') cancelAnimationFrame(e.raf);
    e.timer = null;
    e.raf = null;
    e.running = false;
    e.queue = [];
    e.gen++; // cancels a start that is still waiting for the sound
    cutSound(); // the tones for the whole swing are scheduled ahead, so cut them off now
    if (e.wake && e.wake.release) { try { e.wake.release(); } catch (err) { /* ignore */ } }
    e.wake = null;
    releaseSilentModeAudio();
    if (e.viz) {
      e.viz.beats.forEach((b) => b.classList.remove('on'));
      e.viz.cells.forEach((f) => { f.style.transform = 'scaleX(0)'; });
      e.viz.phase.textContent = 'Stopped';
      e.viz.toggle.textContent = 'Start';
    }
  }
  document.addEventListener('visibilitychange', () => { if (document.hidden) stopTempo(); });

  function metronome() {
    const st = ui.tempo;
    // The dial is a rotary knob like the one on a stereo: a knurled knob that turns, a pointer, and a printed scale around it.
    const CX = 170; const CY = 172; const KR = 112; const CAP = 68; const VB_W = 340;
    const angleOf = (b) => -135 + ((b - BPM_MIN) / (BPM_MAX - BPM_MIN)) * 270;
    const bpmAt = (deg) => BPM_MIN + ((Math.min(135, Math.max(-135, deg)) + 135) / 270) * (BPM_MAX - BPM_MIN);

    const svg = s('svg', { viewBox: '0 0 340 300', class: 'dial', role: 'slider', tabindex: 0, 'aria-label': 'Tempo in beats per minute', 'aria-valuemin': BPM_MIN, 'aria-valuemax': BPM_MAX });
    const grad = (id, stops, extra) => s('radialGradient', { id, ...extra }, ...stops.map(([o, c]) => s('stop', { offset: o, 'stop-color': c })));
    svg.append(s('defs', null,
      grad('dial-body', [['0', '#5b5b61'], ['0.55', '#2c2c30'], ['1', '#161618']], { cx: '0.38', cy: '0.3', r: '0.9' }),
      grad('dial-cap', [['0', '#3a3a3f'], ['1', '#0d0d0f']], { cx: '0.4', cy: '0.3', r: '0.85' })));

    // the printed scale: a mark every 5 BPM, a longer one and a number every 20 BPM; marks light up as the knob passes them
    const scale = [];
    for (let b = BPM_MIN; b <= BPM_MAX; b += 5) {
      const a = angleOf(b);
      const major = (b - BPM_MIN) % 20 === 0;
      const [x0, y0] = polar(CX, CY, KR + 10, a);
      const [x1, y1] = polar(CX, CY, KR + (major ? 24 : 18), a);
      const line = s('line', { class: 'dial-scale' + (major ? ' major' : ''), x1: x0.toFixed(1), y1: y0.toFixed(1), x2: x1.toFixed(1), y2: y1.toFixed(1) });
      scale.push([b, line]);
      svg.append(line);
      if (major) { const [nx, ny] = polar(CX, CY, KR + 47, a); svg.append(s('text', { class: 'dial-num', x: nx.toFixed(1), y: (ny + 3.5).toFixed(1) }, String(b))); }
    }
    let dotEls = [];
    const presetDots = s('g', null);
    svg.append(presetDots);

    // the knob: a dark body with a soft shadow, a ring of ridges and a pointer that turn together, and a fixed centre showing the speed
    svg.append(s('circle', { class: 'dial-shadow', cx: CX, cy: CY + 5, r: KR, fill: '#000' }), s('circle', { cx: CX, cy: CY, r: KR, fill: 'url(#dial-body)' }));
    const rotor = s('g', null);
    for (let i = 0; i < 72; i++) {
      const [x0, y0] = polar(CX, CY, KR - 11, i * 5);
      const [x1, y1] = polar(CX, CY, KR - 1.5, i * 5);
      rotor.append(s('line', { class: 'dial-ridge', x1: x0.toFixed(1), y1: y0.toFixed(1), x2: x1.toFixed(1), y2: y1.toFixed(1) }));
    }
    rotor.append(s('line', { class: 'dial-pointer', x1: CX, y1: CY - CAP - 6, x2: CX, y2: CY - KR + 14 }));
    svg.append(rotor,
      s('circle', { class: 'dial-rim', cx: CX, cy: CY, r: KR - 0.5 }),
      s('circle', { cx: CX, cy: CY, r: CAP, fill: 'url(#dial-cap)', stroke: 'rgba(255,255,255,0.12)', 'stroke-width': 1.5 }));
    const bpmText = s('text', { class: 'dial-bpm', x: CX, y: CY + 12 });
    svg.append(bpmText, s('text', { class: 'dial-sub', x: CX, y: CY + 36 }, 'BPM'));

    const timeEl = h('p', { class: 'tempo-time' });
    const matchEl = h('p', { class: 'hint' });
    const chips = h('div', { class: 'chips', role: 'group', 'aria-label': 'Preset speeds' });
    const segBtns = [];

    function drawDial() {
      const a = angleOf(st.bpm);
      rotor.setAttribute('transform', 'rotate(' + a.toFixed(2) + ' ' + CX + ' ' + CY + ')');
      scale.forEach(([b, line]) => line.classList.toggle('lit', b <= st.bpm + 0.01));
      dotEls.forEach(([b, d]) => d.classList.toggle('on', Math.abs(b - st.bpm) < 0.01));
      const shown = Math.round(st.bpm);
      bpmText.textContent = String(shown);
      svg.setAttribute('aria-valuenow', String(shown));
      svg.setAttribute('aria-valuetext', shown + ' beats per minute');
    }
    function drawTicks() { // a small marker on the scale at each preset speed
      dotEls = TEMPO[st.ratio].frames.map(([, down]) => {
        const b = presetBpm(down);
        const [x, y] = polar(CX, CY, KR + 35, angleOf(b));
        return [b, s('circle', { class: 'dial-preset', cx: x.toFixed(1), cy: y.toFixed(1), r: 3.6 })];
      });
      presetDots.replaceChildren(...dotEls.map(([, d]) => d));
      drawDial();
    }
    function drawChips() {
      chips.replaceChildren(...TEMPO[st.ratio].frames.map(([tot, down]) => h('button', {
        type: 'button', class: 'chip', text: tot + '/' + down, 'aria-pressed': String(Math.abs(st.bpm - presetBpm(down)) < 0.01),
        onclick: () => setBpm(presetBpm(down), true)
      })));
    }
    function drawReadouts() {
      const c = tempoCycle(st.ratio, st.bpm, st.rest);
      timeEl.textContent = 'Takeaway to top ' + c.back.toFixed(2) + ' s, top to impact ' + c.down.toFixed(2) + ' s, whole swing ' + (c.back + c.down).toFixed(2) + ' s. Rest ' + c.pause.toFixed(2) + ' s' + (c.track ? ', as long as the swing.' : ', ' + st.rest + (st.rest === 1 ? ' beat.' : ' beats.'));
      matchEl.textContent = presetMatch(st.ratio, st.bpm);
    }
    function setBpm(b, exact) {
      const v = Math.min(BPM_MAX, Math.max(BPM_MIN, exact ? b : Math.round(b)));
      st.bpm = v;
      drawDial(); drawChips(); drawReadouts();
    }

    // turning the knob: grab it anywhere and turn, like a real one, with no jump. It is geared down, so the finger
    // has to travel 2.5 degrees for every 1 degree the knob turns. The printed scale is for reading only.
    const GEAR = 0.4;
    let turn = null;
    function pointerDeg(e) {
      const r = svg.getBoundingClientRect();
      const k = (r.width || VB_W) / VB_W;
      return (Math.atan2(e.clientX - (r.left + CX * k), -(e.clientY - (r.top + CY * k))) * 180) / Math.PI;
    }
    svg.addEventListener('pointerdown', (e) => {
      if (svg.setPointerCapture) { try { svg.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ } }
      turn = { prev: pointerDeg(e), angle: angleOf(st.bpm) };
      e.preventDefault();
    });
    svg.addEventListener('pointermove', (e) => {
      if (!turn || !(e.buttons || e.pressure > 0)) return;
      const deg = pointerDeg(e);
      let d = deg - turn.prev;
      if (d > 180) d -= 360;
      if (d < -180) d += 360;
      turn.prev = deg;
      turn.angle = Math.min(135, Math.max(-135, turn.angle + d * GEAR)); // the knob stops at both ends
      setBpm(Math.round(bpmAt(turn.angle)));
    });
    const endTurn = () => { turn = null; };
    svg.addEventListener('pointerup', endTurn);
    svg.addEventListener('pointercancel', endTurn);
    svg.addEventListener('keydown', (e) => {
      const step = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1, PageUp: 10, PageDown: -10 }[e.key];
      if (step) { setBpm(Math.round(st.bpm) + step); e.preventDefault(); }
    });

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
    const beats = beatLabels.map((l, i) => h('span', { class: 'beat' + (i === 1 ? ' beat-top' : i === 2 ? ' beat-impact' : ''), 'aria-hidden': 'true' }));
    const bar = h('div', { class: 'tempo-bar', 'aria-hidden': 'true' });
    const phase = h('p', { class: 'now-label', role: 'status', text: 'Stopped' });
    function rebuildBar() {
      const c = tempoCycle(st.ratio, st.bpm, st.rest);
      const cells = [];
      const els = c.boxes.map((bx) => {
        const f = h('span', { class: 'fill' });
        cells.push(f);
        if (bx.collapsed) { // the rest: one box half the size, no number, filling slowly
          return h('div', { class: 'cell cell-rest' }, h('span', { class: 'unit unit-rest' }, f), h('span', { class: 'cell-label' })); // no label: the Impact label beside it needs the room
        }
        return h('div', { class: 'cell' },
          h('span', { class: 'unit unit-' + bx.phase + (bx.tone !== null ? ' unit-tone tone-' + bx.tone : '') }, f),
          h('span', { class: 'cell-label' + (bx.tone !== null ? ' tone-' + bx.tone : ''), text: bx.tone !== null ? beatLabels[bx.tone] : '' }));
      });
      bar.replaceChildren(...els);
      if (tempoEngine.viz) tempoEngine.viz.cells = cells;
    }
    // a change to the ratio or the rest starts the pattern again so the bar and the tones stay together
    const restartIfRunning = () => { if (tempoEngine.running) { stopTempo(); startTempo(); } };
    const toggle = h('button', { type: 'button', class: 'primary tempo-go', text: tempoEngine.running ? 'Stop' : 'Start', onclick: () => { if (tempoEngine.running) stopTempo(); else startTempo(); } });
    tempoEngine.viz = { beats, cells: [], phase, toggle };
    rebuildBar();

    const soundCb = h('input', { type: 'checkbox' });
    soundCb.checked = !!st.sound;
    soundCb.addEventListener('change', () => { st.sound = soundCb.checked; });
    const tickCb = h('input', { type: 'checkbox' });
    tickCb.checked = !!st.ticks;
    tickCb.addEventListener('change', () => { st.ticks = tickCb.checked; });
    drawDial(); drawTicks(); drawChips(); drawReadouts();

    return h('div', { class: 'stack' },
      ratioCtl,
      h('div', { class: 'card' },
        h('div', { class: 'beats' }, beats.map((b, i) => h('div', { class: 'beat-col' }, b, h('span', { class: 'beat-label', text: beatLabels[i] })))),
        bar,
        phase,
        toggle),
      h('div', { class: 'card' },
        h('strong', { text: 'Preset speeds' }),
        chips),
      h('div', { class: 'card tempo-card' }, svg,
        timeEl, matchEl),
      h('div', { class: 'card stack' },
        h('label', { class: 'check' }, soundCb, 'Sound on'),
        h('label', { class: 'check' }, tickCb, 'Soft click on the other beats')),
      h('button', {
        type: 'button', class: 'ghost',
        text: 'Log this session',
        onclick: () => { stopTempo(); drafts.tempo = { id: null, date: today(), ratio: st.ratio, bpm: st.bpm, notes: '' }; ui.mode = 'history'; renderApp(true); }
      }),
      h('p', { class: 'hint', text: 'Three tones mark the takeaway, the top of the backswing and impact. From takeaway to top is 2 beats for a short game swing or 3 beats for a full swing. In the short game impact is 1 beat after the top. In the long game it comes a little later than 1 beat. Turn the dial to any speed, including slower than the presets. The sound plays through your media volume, so the silent switch should not mute it.' }));
  }

  function tempoBody(rec) {
    const c = tempoCycle(rec.ratio, rec.bpm, 0);
    return [
      h('p', { text: tempoLabel(rec) }),
      h('p', { text: 'Takeaway to top ' + c.back.toFixed(2) + ' s, top to impact ' + c.down.toFixed(2) + ' s. ' + presetMatch(rec.ratio, rec.bpm) }),
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
      leaveEdit(d);
      drafts.tempo = freshTempo();
      renderApp(true);
      toast(d.id ? 'Changes saved' : 'Tempo session saved');
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
        d.id ? h('button', { type: 'button', class: 'ghost', text: 'Cancel edit', onclick: () => { leaveEdit(d); drafts.tempo = freshTempo(); renderApp(true); } }) : null),
      list.length
        ? h('div', { class: 'group' }, list.map((rec) => entryShell(
          [h('span', { class: 'd', text: fmtDate(rec.date) }), h('span', { class: 'sum', text: rec.ratio + ' at ' + rec.bpm + ' BPM' })],
          tempoBody(rec),
          () => startEdit('tempo', rec),
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
     Rounds: scores and the Tiger 5
     The Tiger 5 are five things Tiger Woods tries to avoid in a round. Here the fourth is "missed greens with a 9 iron or less".
     ========================================================== */
  const T5 = [
    ['parFiveBogeys', 'Bogeys or worse on par 5s', 'Par 5s where you made bogey or worse.'],
    ['doubles', 'Double bogeys or worse', 'Any hole of double bogey or worse.'],
    ['threePutts', '3-putts', 'Holes where you took three putts or more.'],
    ['missedGreens', 'Missed greens with a 9 iron or less', 'Approach shots with a 9 iron or a wedge that missed the green.'],
    ['doubleChips', 'Double chips', 'Holes where it took two chips or pitches to reach the green.']
  ];
  const tiger5 = (r) => T5.reduce((a, [k]) => a + (r[k] || 0), 0);
  const vsParText = (n) => (n === 0 ? 'E' : n > 0 ? '+' + n : '\u2212' + Math.abs(n));
  const vsPar = (r) => r.score - r.par;
  const pctText = (a, b) => (b > 0 ? Math.round((a / b) * 100) + '%' : '\u2013');

  function roundBody(r) {
    const line = (label, value) => h('p', null, h('strong', { text: label + ': ' }), value);
    return [
      line('Course', r.course || 'Not recorded'),
      line('Tees', r.tees || 'Not recorded'),
      line('Score', r.score + ' on a par ' + r.par + ' (' + vsParText(vsPar(r)) + '), ' + r.holes + ' holes'),
      h('div', { class: 'hist-item' },
        h('strong', { text: 'Tiger 5: ' + tiger5(r) }),
        T5.map(([k, label]) => h('p', { text: label + ': ' + r[k] }))),
      h('div', { class: 'hist-item' },
        line('Greens in regulation', r.gir + ' of ' + r.holes + ' (' + pctText(r.gir, r.holes) + ')'),
        line('Drivers not in play', String(r.driversOut)),
        line('Up and downs', r.udChances > 0 ? r.udMade + ' of ' + r.udChances + ' (' + pctText(r.udMade, r.udChances) + ')' : String(r.udMade))),
      para('Notes', r.notes)
    ];
  }
  const roundSummary = (r) => [h('span', { class: 'd', text: fmtDate(r.date) }), h('span', { class: 'sum', text: (r.course ? r.course + ', ' : '') + r.score + ' (' + vsParText(vsPar(r)) + ')' })];

  // A plain line chart for values that are not percentages (scores, counts), with its own range.
  function valueChart(dates, vals, label, opts) {
    const o = opts || {};
    const W = 320, H = 170, L = 36, R = 8, T = 10, B = 24;
    const got = vals.filter((v) => v != null);
    let lo = Math.min(...got);
    let hi = Math.max(...got);
    if (o.bench != null) { lo = Math.min(lo, o.bench); hi = Math.max(hi, o.bench); }
    if (o.min != null) lo = Math.min(lo, o.min);
    if (o.max != null) hi = Math.max(hi, o.max);
    if (hi - lo < 2) { hi += 1; lo -= 1; }
    if (!o.noPad) { const pad = (hi - lo) * 0.1; lo -= pad; hi += pad; }
    const fmt = o.fmt || ((v) => String(Math.round(v * 10) / 10));
    const x = (i) => L + (dates.length === 1 ? 0 : (i * (W - L - R)) / (dates.length - 1));
    const y = (v) => T + ((hi - v) * (H - T - B)) / (hi - lo);
    const svg = s('svg', { viewBox: '0 0 ' + W + ' ' + H, class: 'chart', role: 'img', 'aria-label': label });
    [lo, (lo + hi) / 2, hi].forEach((v) => {
      svg.append(s('line', { x1: L, x2: W - R, y1: y(v), y2: y(v), class: 'grid' }), s('text', { x: L - 4, y: y(v) + 3, class: 'axis', 'text-anchor': 'end' }, fmt(v)));
    });
    if (o.bench != null) svg.append(s('line', { x1: L, x2: W - R, y1: y(o.bench), y2: y(o.bench), class: 'bench' }), s('text', { x: W - R, y: y(o.bench) - 4, class: 'axis bench-label', 'text-anchor': 'end' }, o.benchLabel || ''));
    const pts = vals.map((v, i) => (v == null ? null : { x: x(i), y: y(v) })).filter(Boolean);
    if (pts.length > 1) svg.append(s('polyline', { points: pts.map((q) => q.x.toFixed(1) + ',' + q.y.toFixed(1)).join(' '), class: 'line l0' }));
    pts.forEach((q) => svg.append(s('circle', { cx: q.x.toFixed(1), cy: q.y.toFixed(1), r: 3, class: 'pt l0' })));
    svg.append(s('text', { x: L, y: H - 8, class: 'axis' }, shortDate(dates[0])), s('text', { x: W - R, y: H - 8, class: 'axis', 'text-anchor': 'end' }, shortDate(dates[dates.length - 1])));
    return svg;
  }

  function roundForm() {
    const d = drafts.round;
    const editing = !!d.id;
    const rounds = session.data.rounds;
    const uniq = (key) => [...new Set(rounds.map((r) => r[key]).filter(Boolean))];
    const sumEl = h('p', { class: 'avg' });
    const t5El = h('p', { class: 'avg' });
    const num0 = (v) => Number(String(v).replace(/[^0-9]/g, ''));
    function refresh() {
      const sc = num0(d.score); const pr = num0(d.par);
      sumEl.textContent = sc > 0 && pr > 0 ? 'Score ' + sc + ' on a par ' + pr + ': ' + vsParText(sc - pr) + ' vs par' : 'Enter your score and the par to see your score vs par.';
      t5El.textContent = 'Tiger 5 total: ' + T5.reduce((a, [k]) => a + d[k], 0);
    }
    function counter(key, label, hint) {
      const out = h('output', { class: 'score-out', text: String(d[key]) });
      const step = (delta) => () => { d[key] = Math.min(d.holes, Math.max(0, d[key] + delta)); out.textContent = String(d[key]); refresh(); };
      return h('div', { class: 'count-row' },
        h('div', { class: 'count-text' }, h('strong', { text: label }), hint ? h('span', { class: 'hint', text: hint }) : null),
        h('div', { class: 'stepper' },
          h('button', { type: 'button', class: 'ghost', text: '\u2212', 'aria-label': 'One fewer: ' + label, onclick: step(-1) }),
          out,
          h('button', { type: 'button', class: 'ghost', text: '+', 'aria-label': 'One more: ' + label, onclick: step(1) })));
    }
    const numInput = (key, label, max) => {
      const el = h('input', { type: 'text', inputmode: 'numeric', maxlength: max, 'aria-label': label, value: String(d[key]) });
      el.addEventListener('input', () => { d[key] = el.value.replace(/[^0-9]/g, ''); refresh(); });
      return el;
    };
    const holeBtns = h('div', { class: 'seg-ctl', role: 'group', 'aria-label': 'Holes played' }, [18, 9].map((n) => h('button', {
      type: 'button', class: 'seg-btn', text: n + ' holes', 'aria-pressed': String(d.holes === n),
      onclick: () => {
        if (d.holes === n) return;
        if (num0(d.par) > 0) d.par = Math.round((num0(d.par) * n) / d.holes); // keep the par in step with the number of holes (72 becomes 36)
        d.holes = n;
        ['threePutts', 'parFiveBogeys', 'doubles', 'missedGreens', 'doubleChips', 'driversOut', 'gir', 'udMade', 'udChances'].forEach((k) => { d[k] = Math.min(d[k], n); });
        renderApp();
      }
    })));
    const courseEl = h('input', { type: 'text', maxlength: 120, list: 'course-list', placeholder: 'For example: Royal Birkdale', value: d.course });
    courseEl.addEventListener('input', () => { d.course = courseEl.value; });
    const teesEl = h('input', { type: 'text', maxlength: 40, list: 'tees-list', placeholder: 'For example: White', value: d.tees });
    teesEl.addEventListener('input', () => { d.tees = teesEl.value; });

    async function save() {
      const score = num0(d.score); const par = num0(d.par);
      if (!(score >= d.holes && score <= 300)) { toast('Enter your total score'); return; }
      if (!(par >= d.holes * 3 && par <= d.holes * 5)) { toast('Enter the par for the holes played: about ' + (d.holes === 9 ? '36' : '72')); return; }
      if (d.gir > d.holes || d.udMade > d.holes) { toast('Those counts are more than the holes played'); return; }
      if (d.udChances > 0 && d.udMade > d.udChances) { toast('Up and downs made cannot be more than the chances'); return; }
      upsert(session.data.rounds, {
        id: d.id || uid(),
        date: isDate(d.date) ? d.date : today(),
        course: d.course.trim().slice(0, 120),
        tees: d.tees.trim().slice(0, 40),
        holes: d.holes,
        score, par,
        threePutts: d.threePutts, parFiveBogeys: d.parFiveBogeys, doubles: d.doubles, missedGreens: d.missedGreens, doubleChips: d.doubleChips,
        driversOut: d.driversOut, gir: d.gir, udMade: d.udMade, udChances: d.udChances,
        notes: d.notes.trim().slice(0, 3000)
      });
      await persist();
      leaveEdit(d, 'history');
      drafts.round = freshRound();
      renderApp(true);
      toast(editing ? 'Changes saved' : 'Round saved');
    }
    refresh();
    return h('div', { class: 'stack' },
      editing ? h('p', { class: 'banner', text: 'Editing an earlier round' }) : null,
      h('datalist', { id: 'course-list' }, uniq('course').map((c) => h('option', { value: c }))),
      h('datalist', { id: 'tees-list' }, uniq('tees').map((c) => h('option', { value: c }))),
      field('Date', dateInput(d)),
      field('Where the round was', courseEl),
      field('Tees', teesEl),
      holeBtns,
      h('div', { class: 'two-up' }, field('Total score', numInput('score', 'Total score', 3)), field('Par', numInput('par', 'Course par', 2))),
      sumEl,
      h('h3', { class: 'sub', text: 'Tiger 5' }),
      h('p', { class: 'hint', text: 'Count each of these during the round. Fewer is better.' }),
      h('div', { class: 'panel count-list' }, T5.map(([k, label, hint]) => counter(k, label, hint))),
      t5El,
      h('h3', { class: 'sub', text: 'Other stats' }),
      h('div', { class: 'panel count-list' },
        counter('gir', 'Greens in regulation'),
        counter('driversOut', 'Drivers not in play', 'Tee shots with a driver that finished out of play: out of bounds, lost, a penalty or no shot at the green.'),
        counter('udMade', 'Up and downs made'),
        counter('udChances', 'Up and down chances', 'Holes where you missed the green and had a chance to save par or better.')),
      field('Notes', textArea(d, 'notes', 4, 3000)),
      h('div', { class: 'actions' },
        h('button', { type: 'button', class: 'primary', text: editing ? 'Save changes' : 'Save round', onclick: save }),
        editing ? h('button', { type: 'button', class: 'ghost', text: 'Cancel edit', onclick: () => { leaveEdit(d); drafts.round = freshRound(); renderApp(true); } }) : null));
  }

  function roundHistory() {
    const list = [...session.data.rounds].sort(byDateDesc);
    if (!list.length) return h('p', { class: 'empty', text: 'No rounds yet. Add your first one under New round.' });
    return h('div', { class: 'group' }, list.map((rec) => entryShell(roundSummary(rec), roundBody(rec), () => startEdit('round', rec), () => removeRecord('rounds', rec.id))));
  }

  function roundStats() {
    const all = [...session.data.rounds].sort((a, b) => a.date.localeCompare(b.date));
    if (!all.length) return h('p', { class: 'empty', text: 'No rounds yet. Your averages and charts appear here once you save a round.' });
    const last5 = all.slice(-5);
    // Counts are shown per 18 holes so a nine-hole round counts for half.
    const per18 = (rs, f) => { const holes = rs.reduce((a, r) => a + r.holes, 0); return holes ? (rs.reduce((a, r) => a + f(r), 0) / holes) * 18 : null; };
    const one = (v) => (v == null ? '\u2013' : String(Math.round(v * 10) / 10));
    const rowsDef = [
      ['Rounds', (rs) => String(rs.length)],
      ['Score vs par (18 holes)', (rs) => { const v = per18(rs, vsPar); return v == null ? '\u2013' : (v > 0 ? '+' : v < 0 ? '\u2212' : '') + Math.abs(Math.round(v * 10) / 10); }],
      ['Tiger 5 total', (rs) => one(per18(rs, tiger5))],
      ...T5.map(([k, label]) => ['\u00a0\u00a0' + label, (rs) => one(per18(rs, (r) => r[k]))]),
      ['Greens in regulation', (rs) => pctText(rs.reduce((a, r) => a + r.gir, 0), rs.reduce((a, r) => a + r.holes, 0))],
      ['Drivers not in play', (rs) => one(per18(rs, (r) => r.driversOut))],
      ['Up and downs made', (rs) => one(per18(rs, (r) => r.udMade))],
      ['Up and down success', (rs) => { const w = rs.filter((r) => r.udChances > 0); return pctText(w.reduce((a, r) => a + r.udMade, 0), w.reduce((a, r) => a + r.udChances, 0)); }]
    ];
    const table = h('table', { class: 'stats-table' },
      h('thead', null, h('tr', null, h('th', { text: 'Per 18 holes' }), h('th', { text: 'All rounds' }), h('th', { text: 'Last 5' }))),
      h('tbody', null, rowsDef.map(([label, f]) => h('tr', null, h('th', { scope: 'row', text: label }), h('td', { text: f(all) }), h('td', { text: f(last5) })))));
    const dates = all.map((r) => r.date);
    const chart = (title, vals, opts, hint) => (all.length > 1
      ? h('div', { class: 'stack card' }, sectionHead('rounds', title), valueChart(dates, vals, title, opts), hint ? h('p', { class: 'hint', text: hint }) : null)
      : null);
    return h('div', { class: 'stack' },
      h('div', { class: 'card stack' }, sectionHead('rounds', 'Averages'), table,
        h('p', { class: 'hint', text: 'Counts are scaled to 18 holes, so a nine-hole round counts for half. Fewer is better for the Tiger 5, drivers not in play and score vs par.' })),
      all.length > 1 ? null : h('p', { class: 'hint', text: 'Save two or more rounds to see charts over time.' }),
      chart('Score vs par', all.map((r) => (r.score - r.par) / r.holes * 18), { fmt: (v) => vsParText(Math.round(v)) }, 'Lower is better. Nine-hole rounds are doubled.'),
      chart('Tiger 5 total', all.map((r) => tiger5(r) / r.holes * 18), { min: 0 }, 'Lower is better. Per 18 holes.'),
      chart('Greens in regulation', all.map((r) => (r.gir / r.holes) * 100), { min: 0, max: 100, noPad: true, fmt: (v) => Math.round(v) + '%' }),
      chart('Up and down success', all.map((r) => (r.udChances > 0 ? (r.udMade / r.udChances) * 100 : null)), { min: 0, max: 100, noPad: true, fmt: (v) => Math.round(v) + '%' }, 'Rounds with no up and down chances recorded are left out.'));
  }

  function roundsView() {
    if (!['new', 'history', 'stats'].includes(ui.mode)) ui.mode = 'new';
    return h('section', null,
      pageTitle('rounds', 'Rounds'),
      modeBar([['new', 'New round'], ['history', 'History'], ['stats', 'Stats']]),
      ui.mode === 'history' ? roundHistory() : ui.mode === 'stats' ? roundStats() : roundForm());
  }


  /* ==========================================================
     Tiger 5 trends: your Tiger 5 and other stats over time, set against what golfers at 0, 5, 10, 15 and 20 handicaps typically make.
     All numbers are per 18 holes, so a nine-hole round counts for half.
     ========================================================== */
  const T5_LEVELS = [0, 5, 10, 15, 20];
  const T5_LEVEL_KEY = 'golfpractice.tiger5.level.v1';
  function loadT5Level() { try { const v = Number(localStorage.getItem(T5_LEVEL_KEY)); return T5_LEVELS.includes(v) ? v : 10; } catch (e) { return 10; } }
  function saveT5Level(v) { try { localStorage.setItem(T5_LEVEL_KEY, String(v)); } catch (e) { /* ignore */ } }

  // vals: the typical figure at handicaps 0, 5, 10, 15, 20. est: true when it is modelled from related published data rather than
  // published directly. cost: rough strokes lost for each extra event, used only to put the stats in order of what to work on.
  const T5_METRICS = [
    { key: 'parFiveBogeys', kind: 'count', tiger: true, label: 'Bogeys or worse on par 5s', short: 'Par 5 bogeys', color: '#af52de', vals: [0.8, 1.7, 2.4, 2.9, 3.4], est: true, cost: 1,
      tab: 'transfer', fix: 'Par 5s are won with a tee shot in play and a sensible second. Play the course games in Transfer training with your driver and your lay-up club, and pick the number you will lay up to before you start.',
      basis: 'There is no published per-round figure for this. It is modelled from the average score on par 5s at each handicap (4.8, 5.3, 5.6, 6.0 and 6.3), turned into the share of par 5s ending in bogey or worse (about 20, 42, 60, 72 and 85 percent) and applied to four par 5s a round. A course with fewer par 5s will give you lower counts.' },
    { key: 'doubles', kind: 'count', tiger: true, label: 'Double bogeys or worse', short: 'Doubles', color: '#007aff', vals: [0.3, 1.6, 2.9, 4.7, 6.7], est: false, cost: 1,
      tab: 'transfer', fix: 'Doubles come from one bad swing followed by a bad decision. The pressure and course games in Transfer training build the recovery routine. On the course, take the safe spot and make your bogey.',
      basis: 'Averages from large sets of tracked amateur rounds.' },
    { key: 'threePutts', kind: 'count', tiger: true, label: '3-putts', short: '3-putts', color: '#34c759', vals: [0.8, 1.5, 2.4, 3.8, 4.6], est: false, cost: 1,
      tab: 'putting', fix: 'Most 3-putts start with the first putt. Every Putting session opens with the Essential pace ladder, which trains your speed from 5 to 30 feet.',
      basis: 'Averages from large sets of tracked amateur rounds. Other sets of tracked rounds give similar or lower figures.' },
    { key: 'missedGreens', kind: 'count', tiger: true, label: 'Missed greens with a 9 iron or less', short: 'Missed greens', color: '#ff9500', vals: [2.0, 2.6, 3.1, 3.6, 4.0], est: true, cost: 0.5,
      tab: 'calibration', fix: 'Missing with a scoring club comes down to strike and distance. Use the Calibration drills for face strike, low point and clubface direction with your wedges and short irons, then the wedge distance games in Short game.',
      basis: 'The miss rate comes from tracked approach shots: from 100 yards in the fairway golfers at 0, 5, 10, 15 and 20 hit the green 74, 65, 57, 49 and 42 percent of the time, and with a 9 iron 60, 47, 40, 32 and about 27 percent. Blended for a 9 iron down to a wedge, that is roughly 33, 44, 52, 60 and 66 percent missed. The number of such approaches a round is not published, so about six a round is assumed.' },
    { key: 'doubleChips', kind: 'count', tiger: true, label: 'Double chips', short: 'Double chips', color: '#ff2d55', vals: [0.2, 0.3, 0.5, 0.7, 0.9], est: true, cost: 1,
      tab: 'shortgame', fix: 'Two chips usually means a poor strike or the wrong landing spot. The Short game games, such as Par 21 and the bunker and short-sided games, put those shots under pressure.',
      basis: 'There is no published figure for double chips. The one related figure is that golfers who shoot in the 90s miss the green from inside 20 yards about 10 percent of the time. That is scaled down for better players and multiplied by the chips a round (about 60 percent of the greens you miss). Treat it as the weakest benchmark here.' },
    { key: 'gir', kind: 'pct', label: 'Greens in regulation', short: 'Greens', vals: [56.8, 46.1, 37.3, 26.4, 22.4], est: false, cost: 0.5,
      tab: 'calibration', fix: 'Greens come from approach distance and face direction. Work through the Calibration drills, then the Transfer games, with your mid and short irons.',
      basis: 'Average from a large set of tracked amateur rounds, with other sets within a few points.' },
    { key: 'ud', kind: 'pct', label: 'Up and down success', short: 'Up and downs', vals: [50.0, 37.7, 31.6, 25.1, 21.7], est: false, cost: 1,
      tab: 'shortgame', fix: 'Up and downs come from the landing spot and a holeable second putt. The Short game area games and Up and down streak give you reps under pressure.',
      basis: 'Average from a large set of tracked amateur rounds.' },
    { key: 'driversOut', kind: 'count', label: 'Drivers not in play', short: 'Drivers out', vals: [1.3, 1.8, 2.5, 3.1, 3.7], est: true, cost: 1.5,
      tab: 'calibration', fix: 'Drivers out of play are a face-direction problem. The Clubface direction drills in Calibration score where the ball finishes, not where it starts. Use them with the driver.',
      basis: 'Tracked driving data gives the share of driver tee shots that end in a penalty or a recovery shot: 12 percent for 0 to 4.9 handicaps, about 23 percent for 10 to 15, 38 percent for 25 to 30 and 45 percent for 30 and over. The figures here fill in between those at about 11, 15, 20, 26 and 31 percent and apply them to about twelve drivers a round, which fits one to two a round for scratch golfers.' },
    { key: 'vspar', kind: 'vspar', label: 'Score vs par', short: 'Score', vals: [2.6, 7.0, 12.6, 17.3, 21.7], est: false, cost: 0,
      basis: 'Average gross scores of 74.6, 79.0, 84.6, 89.3 and 93.7 from tracked rounds, against a par of 72.' }
  ];
  const T5_BY_KEY = Object.fromEntries(T5_METRICS.map((m) => [m.key, m]));
  const T5_FIVE = T5_METRICS.filter((m) => m.tiger);
  const T5_TOTAL = [0, 1, 2, 3, 4].map((i) => Math.round(T5_FIVE.reduce((a, m) => a + m.vals[i], 0) * 10) / 10);
  const bench = (m, level) => m.vals[T5_LEVELS.indexOf(level)];

  const sumBy = (rs, f) => rs.reduce((a, r) => a + f(r), 0);
  // The value of a stat over some rounds, per 18 holes (or as a percentage).
  function t5Value(rs, m) {
    if (!rs.length) return null;
    const holes = sumBy(rs, (r) => r.holes);
    if (m.key === 'gir') return (sumBy(rs, (r) => r.gir) / holes) * 100;
    if (m.key === 'ud') { const w = rs.filter((r) => r.udChances > 0); const c = sumBy(w, (r) => r.udChances); return c ? (sumBy(w, (r) => r.udMade) / c) * 100 : null; }
    if (m.key === 'vspar') return (sumBy(rs, (r) => r.score - r.par) / holes) * 18;
    return (sumBy(rs, (r) => r[m.key]) / holes) * 18;
  }
  const t5Total = (rs) => (rs.length ? (sumBy(rs, tiger5) / sumBy(rs, (r) => r.holes)) * 18 : null);
  function t5RoundValue(r, m) {
    if (m.key === 'gir') return (r.gir / r.holes) * 100;
    if (m.key === 'ud') return r.udChances > 0 ? (r.udMade / r.udChances) * 100 : null;
    if (m.key === 'vspar') return ((r.score - r.par) / r.holes) * 18;
    return (r[m.key] / r.holes) * 18;
  }
  const t5Fmt = (m, v) => (v == null ? '\u2013' : m.kind === 'pct' ? Math.round(v) + '%' : m.kind === 'vspar' ? vsParText(Math.round(v)) : String(Math.round(v * 10) / 10));
  const fmt1 = (v) => String(Math.round(v * 10) / 10);
  // The page's security policy does not allow style attributes, so styles are set on the element's style object instead.
  function styled(el, props) { Object.entries(props).forEach(([k, v]) => el.style.setProperty(k, v)); return el; }

  // Where a value sits on the handicap scale, by working between the typical figures at 0, 5, 10, 15 and 20.
  function handicapOf(vals, v) {
    const dir = vals[4] > vals[0] ? 1 : -1;
    const xs = vals.map((x) => x * dir);
    const y = v * dir;
    let i = 0;
    while (i < 3 && y > xs[i + 1]) i++;
    return 5 * i + (5 * (y - xs[i])) / (xs[i + 1] - xs[i] || 1);
  }
  function t5Status(m, v, b) {
    if (v == null) return 'none';
    if (m.kind === 'pct') return v >= b ? 'good' : v >= b - 4 ? 'ok' : 'bad';
    if (m.kind === 'vspar') return v <= b ? 'good' : v <= b + 2 ? 'ok' : 'bad';
    return v <= b ? 'good' : v <= b * 1.25 || v - b <= 0.4 ? 'ok' : 'bad';
  }
  const hcpWords = (h) => (h < -0.5 ? 'better than scratch' : h > 20.5 ? 'worse than a 20' : 'about a ' + Math.max(0, Math.round(h)) + ' handicap');
  const gapWords = (m, v, b) => {
    const d = m.kind === 'pct' ? b - v : v - b; // positive means worse than the benchmark
    const unit = m.kind === 'pct' ? ' points' : '';
    const n = m.kind === 'pct' ? String(Math.round(Math.abs(d))) : fmt1(Math.abs(d));
    return Math.abs(d) < (m.kind === 'pct' ? 0.5 : 0.05) ? 'level with' : n + unit + (d > 0 ? ' worse than' : ' better than');
  };

  function t5Priorities(rs, level) {
    const per18Chances = rs.length ? (sumBy(rs, (r) => r.udChances) / sumBy(rs, (r) => r.holes)) * 18 : 0;
    return T5_METRICS.filter((m) => m.cost > 0).map((m) => {
      const v = t5Value(rs, m);
      if (v == null) return null;
      const b = bench(m, level);
      const gap = m.kind === 'pct' ? Math.max(0, b - v) : Math.max(0, v - b);
      let strokes = 0;
      if (m.key === 'gir') strokes = ((gap / 100) * 18) * m.cost;
      else if (m.key === 'ud') strokes = (gap / 100) * (per18Chances || 10) * m.cost;
      else strokes = gap * m.cost;
      return { m, v, b, gap, strokes };
    }).filter((x) => x && x.strokes >= 0.1).sort((a, b) => b.strokes - a.strokes);
  }

  // A small line chart with a dashed line for the benchmark.
  function spark(vals, b, m) {
    const W = 150, H = 50, P = 5;
    const got = vals.filter((v) => v != null);
    let lo = Math.min(...got, b);
    let hi = Math.max(...got, b);
    if (hi - lo < 0.5) { hi += 0.5; lo -= 0.5; }
    const x = (i) => (vals.length === 1 ? W / 2 : P + (i * (W - 2 * P)) / (vals.length - 1));
    const y = (v) => P + ((hi - v) * (H - 2 * P)) / (hi - lo);
    const svg = s('svg', { viewBox: '0 0 ' + W + ' ' + H, class: 'spark', 'aria-hidden': 'true' });
    svg.append(s('line', { x1: 0, x2: W, y1: y(b).toFixed(1), y2: y(b).toFixed(1), class: 'bench' }));
    const pts = vals.map((v, i) => (v == null ? null : [x(i), y(v)])).filter(Boolean);
    if (pts.length > 1) svg.append(s('polyline', { points: pts.map((q) => q[0].toFixed(1) + ',' + q[1].toFixed(1)).join(' '), class: 'spark-line' }));
    pts.forEach((q, i) => svg.append(s('circle', { cx: q[0].toFixed(1), cy: q[1].toFixed(1), r: i === pts.length - 1 ? 3.6 : 2, class: 'spark-pt' + (i === pts.length - 1 ? ' last st-' + t5Status(m, got[got.length - 1], b) : '') })));
    return svg;
  }

  function tiger5View() {
    const all = [...session.data.rounds].sort((a, b) => a.date.localeCompare(b.date));
    const level = ui.t5.level;
    const win = ui.t5.win;
    const rs = win === 'all' ? all : all.slice(-5);
    const prev = win === 'last5' && all.length >= 6 ? all.slice(Math.max(0, all.length - 10), all.length - 5) : null;
    const setLevel = (v) => { ui.t5.level = v; saveT5Level(v); renderApp(); };

    const controls = h('div', { class: 'stack t5-controls' },
      h('div', { class: 't5-label', text: 'Compare with a handicap of' }),
      h('div', { class: 'seg-ctl', role: 'group', 'aria-label': 'Compare with a handicap of' }, T5_LEVELS.map((v) => h('button', { type: 'button', class: 'seg-btn', text: String(v), 'aria-pressed': String(level === v), onclick: () => setLevel(v) }))),
      h('div', { class: 'seg-ctl', role: 'group', 'aria-label': 'Rounds to include' }, [['last5', 'Last 5 rounds'], ['all', 'All rounds']].map(([id, label]) => h('button', {
        type: 'button', class: 'seg-btn', text: label, 'aria-pressed': String(win === id), onclick: () => { ui.t5.win = id; renderApp(); }
      }))));

    const benchTable = h('table', { class: 'stats-table bench-table' },
      h('thead', null, h('tr', null, h('th', { text: 'Per 18 holes' }), T5_LEVELS.map((v) => h('th', { text: String(v) })))),
      h('tbody', null,
        T5_FIVE.map((m) => h('tr', null, h('th', { scope: 'row', text: m.label }), m.vals.map((v, i) => h('td', { class: T5_LEVELS[i] === level ? 'cur' : '', text: fmt1(v) })))),
        h('tr', { class: 'total' }, h('th', { scope: 'row', text: 'Tiger 5 total' }), T5_TOTAL.map((v, i) => h('td', { class: T5_LEVELS[i] === level ? 'cur' : '', text: fmt1(v) }))),
        T5_METRICS.filter((m) => !m.tiger).map((m) => h('tr', null, h('th', { scope: 'row', text: m.label }), m.vals.map((v, i) => h('td', { class: T5_LEVELS[i] === level ? 'cur' : '', text: (m.kind === 'pct' ? Math.round(v) + '%' : m.kind === 'vspar' ? vsParText(Math.round(v)) : fmt1(v)) }))))));
    const about = disclosure('t5-about', 'About the benchmarks', 'Hide the benchmarks', [
      benchTable,
      h('p', { class: 'hint', text: 'The columns are the handicap. Bogeys or worse on par 5s, missed greens, double chips and drivers not in play are estimates, because no direct per-round figure exists; the notes below say how each was built. The rest are averages from large sets of tracked amateur rounds. Drivers not in play and missed greens rest on tracked rates and need only one assumption each (drives and approaches a round). Different sets of tracked rounds give different figures, for example scratch golfers average anywhere from about 0.5 to 1.7 three-putts a round, so treat the benchmarks as a guide, not a target to the decimal.' }),
      h('div', { class: 'stack' }, T5_METRICS.map((m) => h('p', { class: 'hint' }, h('strong', { text: m.label + ': ' }), m.basis)))
    ]);

    if (!all.length) {
      return h('section', { class: 'stack' },
        pageTitle('tiger5', 'Tiger 5'),
        controls,
        h('p', { class: 'empty', text: 'No rounds yet. Save a round in the Rounds tab and your Tiger 5, greens, up and downs and score appear here, set against what golfers at each handicap typically make.' }),
        h('div', { class: 'card stack' }, sectionHead('tiger5', 'What each handicap typically makes'), benchTable, h('p', { class: 'hint', text: 'Bogeys or worse on par 5s, missed greens, double chips and drivers not in play are estimates.' })));
    }

    // ---- the top card: your Tiger 5 total against the benchmark, with what it is made of ----
    const total = t5Total(rs);
    const tb = T5_TOTAL[T5_LEVELS.indexOf(level)];
    const totalHcp = handicapOf(T5_TOTAL, total);
    const totalStatus = total <= tb ? 'good' : total <= tb * 1.25 ? 'ok' : 'bad';
    const prevTotal = prev ? t5Total(prev) : null;
    const diff = prevTotal == null ? null : total - prevTotal;
    const scale = Math.max(total, tb) || 1;
    const bar = (label, vals, strong) => h('div', { class: 'stack-row' },
      h('span', { class: 'stack-label', text: label }),
      h('div', { class: 'stack-bar' + (strong ? ' you' : '') }, T5_FIVE.map((m, i) => {
        const v = vals[i];
        return styled(h('span', { class: 'seg', title: m.short + ': ' + fmt1(v), text: (v / scale) * 100 >= 11 ? fmt1(v) : '' }), { width: ((v / scale) * 100).toFixed(1) + '%', background: m.color });
      })));
    const yourVals = T5_FIVE.map((m) => t5Value(rs, m));
    const hero = h('div', { class: 'card stack t5-hero' },
      h('div', { class: 't5-hero-top' },
        h('div', null,
          h('div', { class: 't5-small', text: 'Your Tiger 5 per 18 holes' }),
          h('div', { class: 't5-big st-' + totalStatus, text: fmt1(total) })),
        h('div', { class: 't5-hero-side' },
          h('div', { class: 't5-small', text: 'A ' + level + ' handicap' }),
          h('div', { class: 't5-mid', text: fmt1(tb) }))),
      h('p', { class: 't5-line' }, 'You are making Tiger 5 mistakes like ', h('strong', { text: hcpWords(totalHcp) }), ' over ' + (win === 'all' ? 'all ' + rs.length : 'your last ' + rs.length) + (rs.length === 1 ? ' round.' : ' rounds.'),
        diff != null && Math.abs(diff) >= 0.05 ? h('span', { class: 'delta ' + (diff < 0 ? 'good' : 'bad'), text: (diff < 0 ? ' \u25BC ' : ' \u25B2 ') + fmt1(Math.abs(diff)) + ' ' + (diff < 0 ? 'fewer' : 'more') + ' than the 5 rounds before' }) : null),
      bar('You', yourVals, true),
      bar(level + ' hcp', T5_FIVE.map((m) => bench(m, level)), false),
      h('div', { class: 't5-legend' }, T5_FIVE.map((m) => h('span', { class: 'key' }, styled(h('i'), { background: m.color }), m.short))));

    // ---- what to work on, in order ----
    const pri = t5Priorities(rs, level);
    const goTo = (tab) => () => { ui.tab = tab; ui.mode = 'new'; renderApp(true); };
    const lowerLevel = T5_LEVELS[Math.max(0, T5_LEVELS.indexOf(level) - 1)];
    const work = h('div', { class: 'card stack' },
      sectionHead('tiger5', 'Work on first'),
      pri.length
        ? pri.slice(0, 3).map((p, i) => h('div', { class: 'work' },
          h('div', { class: 'work-n', text: String(i + 1) }),
          h('div', { class: 'work-body' },
            h('strong', { text: p.m.label }),
            h('div', { class: 'work-nums' }, h('span', { class: 'st-bad', text: t5Fmt(p.m, p.v) }), ' against ' + t5Fmt(p.m, p.b) + ' for a ' + level + ' handicap. Worth about ' + fmt1(p.strokes) + (p.strokes >= 1.05 || p.strokes < 0.95 ? ' shots' : ' shot') + ' a round.'),
            h('p', { class: 'hint', text: p.m.fix }),
            h('button', { type: 'button', class: 'ghost', text: 'Practise: ' + TABS.find(([id]) => id === p.m.tab)[1], onclick: goTo(p.m.tab) }))))
        : [h('p', { text: 'You are at or ahead of a ' + level + ' handicap on every stat over these rounds. Well played.' }),
          level > 0 ? h('div', { class: 'actions' }, h('button', { type: 'button', class: 'ghost', text: 'Compare with a ' + lowerLevel + ' handicap', onclick: () => setLevel(lowerLevel) })) : null],
      pri.length ? h('p', { class: 'hint', text: 'Ranked by about how many shots a round you would save by matching a ' + level + ' handicap. The stats overlap (a 3-putt can also cause a double), so use it as a guide.' }) : null);

    // ---- every stat on the same handicap ruler ----
    const levelIdx = T5_LEVELS.indexOf(level);
    const ruler = (m) => {
      const v = t5Value(rs, m);
      const b = bench(m, level);
      const st = t5Status(m, v, b);
      const hv = v == null ? null : handicapOf(m.vals, v);
      const pos = hv == null ? 0 : Math.min(104, Math.max(-4, (hv / 20) * 100));
      const prevV = prev ? t5Value(prev, m) : null;
      let trend = null;
      if (v != null && prevV != null && Math.abs(v - prevV) >= (m.kind === 'pct' ? 0.5 : 0.05)) {
        const better = m.kind === 'pct' ? v > prevV : v < prevV;
        trend = h('span', { class: 'delta ' + (better ? 'good' : 'bad'), text: (v > prevV ? '\u25B2' : '\u25BC') + ' ' + (m.kind === 'pct' ? Math.round(Math.abs(v - prevV)) + ' pts' : fmt1(Math.abs(v - prevV))) });
      }
      return h('div', { class: 'rule-row' },
        h('div', { class: 'rule-head' }, h('strong', { text: m.label }), h('span', { class: 'rule-val st-' + st }, t5Fmt(m, v), trend)),
        h('div', { class: 'rule-track' },
          T5_LEVELS.map((lv, i) => styled(h('span', { class: 'rule-tick' + (i === levelIdx ? ' target' : '') }), { left: i * 25 + '%' })),
          v == null ? null : styled(h('span', { class: 'rule-pin st-' + st, 'aria-hidden': 'true' }), { left: pos.toFixed(1) + '%' })),
        h('div', { class: 'rule-labels', 'aria-hidden': 'true' }, T5_LEVELS.map((lv, i) => styled(h('span', { class: i === levelIdx ? 'target' : '', text: String(lv) }), { left: i * 25 + '%' }))),
        h('div', { class: 'rule-foot', text: v == null ? 'Nothing recorded yet' : (hv > 20.5 ? 'Worse than a 20 handicap' : hv < -0.5 ? 'Better than scratch' : 'About a ' + Math.round(Math.max(0, hv)) + ' handicap') + ', ' + gapWords(m, v, b) + ' a ' + level + ' (' + t5Fmt(m, b) + ')' }));
    };
    const rulers = h('div', { class: 'card stack' },
      sectionHead('tiger5', 'Where you stand'),
      h('p', { class: 'hint', text: 'Each stat is placed on the handicap scale, from 0 on the left to 20 on the right. The dot shows the handicap your results match, and the highlighted mark is the one you chose. A dot to the right of it is a weakness.' }),
      h('h3', { class: 'sub', text: 'Tiger 5' }),
      T5_FIVE.map(ruler),
      h('h3', { class: 'sub', text: 'Other stats' }),
      T5_METRICS.filter((m) => !m.tiger).map(ruler));

    // ---- over time ----
    const recent = all.slice(-12);
    const dates = recent.map((r) => r.date);
    const trendCard = (m) => {
      const vals = recent.map((r) => t5RoundValue(r, m));
      const last = [...vals].reverse().find((v) => v != null);
      const b = bench(m, level);
      const st = t5Status(m, last, b);
      return h('div', { class: 'mini' },
        h('div', { class: 'mini-top' }, h('span', { class: 'mini-label', text: m.short }), h('span', { class: 'mini-val st-' + st, text: t5Fmt(m, last) })),
        vals.some((v) => v != null) ? spark(vals, b, m) : h('div', { class: 'spark-empty', text: 'No data' }),
        h('div', { class: 'mini-foot', text: 'Dashed: a ' + level + ' handicap, ' + t5Fmt(m, b) }));
    };
    const totalChart = all.length > 1
      ? [valueChart(all.slice(-20).map((r) => r.date), all.slice(-20).map((r) => (tiger5(r) / r.holes) * 18), 'Tiger 5 total per round', { min: 0, noPad: true, bench: tb, benchLabel: level + ' hcp ' + fmt1(tb) }),
        h('p', { class: 'hint', text: 'Your Tiger 5 total for each round, per 18 holes, against a ' + level + ' handicap. Lower is better.' })]
      : h('p', { class: 'hint', text: 'Save two or more rounds to see your Tiger 5 over time.' });
    const over = h('div', { class: 'card stack' },
      sectionHead('tiger5', 'Over time'),
      totalChart,
      all.length > 1 ? h('div', { class: 'mini-grid' }, T5_METRICS.map(trendCard)) : null,
      all.length > 1 ? h('p', { class: 'hint', text: 'Your last ' + recent.length + ' rounds, per 18 holes. The dot on the right is your latest round, and it is green when it is at or better than a ' + level + ' handicap.' }) : null);

    return h('section', { class: 'stack' },
      pageTitle('tiger5', 'Tiger 5'),
      controls, hero, work, rulers, over,
      h('div', { class: 'card stack' }, about));
  }

  /* ==========================================================
     Practice log: every session, with its drills, notes and scores
     ========================================================== */
  const LOG_NAMES = { calibration: 'Calibration', transfer: 'Transfer', shortgame: 'Short game', putting: 'Putting' };
  function logView() {
    const f = ui.logFilter;
    const filters = [['all', 'All'], ['technique', 'Technique'], ['calibration', 'Calibration'], ['transfer', 'Transfer'], ['shortgame', 'Short game'], ['putting', 'Putting'], ['tempo', 'Tempo'], ['rounds', 'Rounds']];
    const entries = [];
    if (f === 'all' || f === 'technique') {
      session.data.protocols.forEach((rec) => entries.push({ type: 'protocol', rec }));
      session.data.technique.forEach((rec) => entries.push({ type: 'log', rec }));
    }
    ['calibration', 'transfer', 'shortgame', 'putting'].forEach((k) => { if (f === 'all' || f === k) session.data[k].forEach((rec) => entries.push({ type: k, rec })); });
    if (f === 'all' || f === 'tempo') session.data.tempo.forEach((rec) => entries.push({ type: 'tempo', rec }));
    if (f === 'all' || f === 'rounds') session.data.rounds.forEach((rec) => entries.push({ type: 'round', rec }));
    entries.sort((a, b) => b.rec.date.localeCompare(a.rec.date));

    const latest = (kind) => {
      const rec = [...session.data[kind]].sort(byDateDesc).find((r) => hitShare(r.items));
      return rec ? Math.round(hitShare(rec.items).pct) + '%' : null;
    };
    const lastLine = ['calibration', 'transfer', 'shortgame', 'putting'].map((k) => (latest(k) ? LOG_NAMES[k].toLowerCase() + ' ' + latest(k) : null)).filter(Boolean);

    const nodes = entries.map(({ type, rec }) => {
      let tag; let sum; let body; let icon = type;
      if (type === 'log') { tag = 'Quick log'; sum = h('span', { class: 'sum', text: rec.mechanics }); body = logBody(rec); icon = 'technique'; }
      else if (type === 'protocol') {
        const fp = furthestPassed(rec);
        tag = 'Technique protocol, ' + protocolMinutes(rec) + ' min';
        sum = h('span', { class: 'sum', text: rec.mechanic + (fp >= 0 ? ', reached ' + STAGE_SHORT[fp] : '') });
        body = protocolBody(rec);
        icon = 'technique';
      } else if (type === 'tempo') {
        tag = 'Tempo, ' + rec.ratio;
        sum = h('span', { class: 'sum', text: rec.bpm + ' BPM' });
        body = tempoBody(rec);
      } else if (type === 'round') {
        tag = 'Round, ' + rec.holes + ' holes';
        sum = h('span', { class: 'sum', text: (rec.course ? rec.course + ', ' : '') + rec.score + ' (' + vsParText(vsPar(rec)) + ')' });
        body = roundBody(rec);
        icon = 'rounds';
      } else {
        tag = LOG_NAMES[type] + (rec.place === 'sim' ? ' (simulator)' : '') + ', ' + protocolMinutes(rec) + ' min';
        sum = sessionSum(type, rec);
        body = sessionBody(type, rec);
      }
      return h('details', { class: 'entry' },
        h('summary', null, iconTile(icon), h('span', { class: 'd' }, fmtDate(rec.date), h('br'), h('span', { class: 'tag', text: tag })), sum),
        h('div', { class: 'entry-body' }, body,
          h('div', { class: 'actions' },
            h('button', { type: 'button', class: 'ghost', text: 'Edit', onclick: () => startEdit(type, rec, 'log') }),
            h('button', { type: 'button', class: 'danger', text: 'Delete', onclick: () => removeRecord(DATA_KEY[type], rec.id) }))));
    });

    return h('section', { class: 'stack' },
      pageTitle('log', 'Practice log'),
      h('div', { class: 'chips log-filter', role: 'group', 'aria-label': 'Show' },
        filters.map(([id, label]) => h('button', {
          type: 'button', class: 'chip', text: label, 'aria-pressed': String(f === id),
          onclick: () => { ui.logFilter = id; renderApp(); }
        }))),
      lastLine.length ? h('p', { class: 'lead', text: 'Latest average score: ' + lastLine.join(', ') + ' of the maximum.' }) : null,
      h('p', { class: 'hint', text: 'Open any session to edit or delete it. Each calibration, transfer, short game and putting session shows its average score as a percentage of the maximum. Each drill is scored against its own maximum and the drills are averaged. See Practice trends for how it moves over time.' }),
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
