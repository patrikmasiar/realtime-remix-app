import AppConfig from "../config";

export const getRandomAvatarUrl = () => {
  const seeds = ['Jack', 'Missy', 'Muffin', 'Bear', 'Maggie', 'Sasha', 'Chloe', 'Garfield', 'Bubba', 'Zoe', 'Buddy', 'Zoey', 'Sugar', 'Cali', 'Molly', 'Boots', 'Lucky', 'Baby', 'Pepper']
  const randomAvatarSeed = seeds[Math.floor(Math.random() * seeds.length)]

  return `${AppConfig.AVATAR_API_URL}?seed=${randomAvatarSeed}`
}