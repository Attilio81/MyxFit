import type { WOD } from './types';

export const FAMOUS_WODS: WOD[] = [
  {
    name: 'Fran',
    type: 'For Time',
    description: ['21-15-9 reps of:', 'Thrusters (95/65 lb)', 'Pull-ups'],
  },
  {
    name: 'Cindy',
    type: 'AMRAP',
    description: ['As Many Rounds As Possible in 20 minutes of:', '5 Pull-ups', '10 Push-ups', '15 Air Squats'],
  },
  {
    name: 'Murph',
    type: 'For Time',
    description: [
      '1 mile Run',
      '100 Pull-ups',
      '200 Push-ups',
      '300 Air Squats',
      '1 mile Run',
    ],
    notes: 'Partition the pull-ups, push-ups, and squats as needed. If you\'ve got a 20/14 lb weight vest or body armor, wear it.',
  },
  {
    name: 'Grace',
    type: 'For Time',
    description: ['30 Clean and Jerks (135/95 lb)'],
  },
  {
    name: 'Helen',
    type: 'For Time',
    description: [
      '3 Rounds of:',
      '400 meter Run',
      '21 Kettlebell Swings (53/35 lb)',
      '12 Pull-ups',
    ],
  },
  {
    name: 'Angie',
    type: 'For Time',
    description: ['100 Pull-ups', '100 Push-ups', '100 Sit-ups', '100 Air Squats'],
    notes: 'Complete all reps of each exercise before moving to the next.',
  },
  {
    name: 'The Filthy 50',
    type: 'For Time',
    description: [
        '50 Box jumps (24/20 inch box)',
        '50 Jumping pull-ups',
        '50 Kettlebell swings (35/26 lb)',
        '50 Walking lunge steps',
        '50 Knees-to-elbows',
        '50 Push press (45/35 lb)',
        '50 Back extensions',
        '50 Wall-ball shots (20/14 lb ball)',
        '50 Burpees',
        '50 Double-unders'
    ]
  }
];
