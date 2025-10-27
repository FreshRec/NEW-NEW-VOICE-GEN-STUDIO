// This file can be used for shared type definitions.
export const VOICES = [
  { id: 'Kore', name: 'Kore (Женский)' },
  { id: 'Puck', name: 'Puck (Мужской)' },
  { id: 'Charon', name: 'Charon (Мужской)' },
  { id: 'Zephyr', name: 'Zephyr (Женский)' },
  { id: 'Fenrir', name: 'Fenrir (Мужской)' },
  { id: 'Luna', name: 'Luna (Женский)' },
  { id: 'Aries', name: 'Aries (Мужской)' },
  { id: 'Orion', name: 'Orion (Мужской)' },
  { id: 'Ceres', name: 'Ceres (Женский)' },
];

export type Mood = 'нейтрально' | 'весело' | 'грустно' | 'официально' | 'загадочно';

export const MOODS: { id: Mood, name: string }[] = [
    { id: 'нейтрально', name: 'Нейтральное' },
    { id: 'весело', name: 'Веселое' },
    { id: 'грустно', name: 'Грустное' },
    { id: 'официально', name: 'Официальное' },
    { id: 'загадочно', name: 'Загадочное' },
];
