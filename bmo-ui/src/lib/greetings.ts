// ═══════════════════════════════════════════════════════════════════════════
// BMO Dynamic Greeting System - Time, Season, and Weather Aware
// ═══════════════════════════════════════════════════════════════════════════

export interface WeatherData {
    temp: number;
    condition: 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'stormy' | 'windy' | 'foggy' | 'clear';
    icon: string;
    description: string;
}

export type Season = 'spring' | 'summer' | 'autumn' | 'winter';
export type TimeOfDay = 'earlyMorning' | 'morning' | 'afternoon' | 'evening' | 'night' | 'lateNight';

// Get current season based on month (Northern Hemisphere)
export function getSeason(month: number): Season {
    if (month >= 3 && month <= 5) return 'spring';
    if (month >= 6 && month <= 8) return 'summer';
    if (month >= 9 && month <= 11) return 'autumn';
    return 'winter';
}

// Get time of day
export function getTimeOfDay(hour: number): TimeOfDay {
    if (hour >= 5 && hour < 7) return 'earlyMorning';
    if (hour >= 7 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    if (hour >= 21 && hour < 24) return 'night';
    return 'lateNight'; // 0-5
}

// Get month name
export function getMonthName(month: number): string {
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month];
}

// Weather condition based on simple heuristics (can be replaced with API)
export function estimateWeather(hour: number, month: number): WeatherData {
    const season = getSeason(month + 1);

    // Default conditions by season
    const seasonConditions: Record<Season, WeatherData> = {
        winter: { temp: 5, condition: 'snowy', icon: '❄️', description: 'Cold & snowy' },
        spring: { temp: 18, condition: 'cloudy', icon: '🌤️', description: 'Mild & breezy' },
        summer: { temp: 28, condition: 'sunny', icon: '☀️', description: 'Warm & sunny' },
        autumn: { temp: 14, condition: 'cloudy', icon: '🍂', description: 'Cool & crisp' }
    };

    let weather = { ...seasonConditions[season] };

    // Adjust for time of day
    if (hour >= 22 || hour < 6) {
        weather.icon = season === 'winter' ? '🌙❄️' : '🌙';
        weather.condition = 'clear';
        weather.description = 'Clear night';
        weather.temp -= 5;
    } else if (hour >= 6 && hour < 9) {
        weather.icon = season === 'winter' ? '🌅❄️' : '🌅';
        weather.description = 'Fresh morning';
    }

    return weather;
}

// Generate dynamic greeting based on context
export function generateGreeting(
    date: Date = new Date(),
    weather?: WeatherData
): { greeting: string; emoji: string } {
    const hour = date.getHours();
    const month = date.getMonth();
    const day = date.getDate();
    const dayOfWeek = date.getDay();

    const timeOfDay = getTimeOfDay(hour);
    const season = getSeason(month + 1);
    const monthName = getMonthName(month);

    // Special dates
    const isNewYear = month === 0 && day <= 7;
    const isValentine = month === 1 && day === 14;
    const isHalloween = month === 9 && day === 31;
    const isChristmas = month === 11 && (day >= 24 && day <= 26);
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isMonday = dayOfWeek === 1;
    const isFriday = dayOfWeek === 5;

    // Special occasion greetings
    if (isNewYear) return { greeting: "Happy New Year! Let's make it amazing! ✨", emoji: '🎉' };
    if (isValentine) return { greeting: "Spreading love today! BMO loves you! 💕", emoji: '💝' };
    if (isHalloween) return { greeting: "Spooky greetings! Boo! 👻", emoji: '🎃' };
    if (isChristmas) return { greeting: "Merry Christmas! Ho ho ho! 🎄", emoji: '🎅' };

    // Time-based greetings with variety
    const greetings: Record<TimeOfDay, { texts: string[]; emojis: string[] }> = {
        earlyMorning: {
            texts: [
                "Rise and shine! Early bird gets the worm!",
                "Good morning, sunshine! You're up early!",
                "The dawn is beautiful, just like you!",
                "Early morning vibes! Let's seize the day!"
            ],
            emojis: ['🌅', '☀️', '🌄', '✨']
        },
        morning: {
            texts: [
                "Good morning! Ready for an awesome day?",
                "Hey there! Coffee time? ☕",
                "Morning! Let's make today count!",
                "Wakey wakey! BMO is here to help!"
            ],
            emojis: ['☀️', '🌞', '☕', '🌻']
        },
        afternoon: {
            texts: [
                "Good afternoon! How's your day going?",
                "Hey! Taking a productive break?",
                "Afternoon vibes! Keep crushing it!",
                "Hello there! Need a hand with anything?"
            ],
            emojis: ['👋', '🌤️', '💪', '✌️']
        },
        evening: {
            texts: [
                "Good evening! Winding down?",
                "Evening! How was your day?",
                "Hey! Ready for a chill evening?",
                "Golden hour vibes! What's on your mind?"
            ],
            emojis: ['🌆', '🌇', '✨', '🌙']
        },
        night: {
            texts: [
                "Good night! Still working hard?",
                "Night owl mode activated! 🦉",
                "Late night coding session?",
                "The stars are out, and so is BMO!"
            ],
            emojis: ['🌙', '⭐', '🦉', '🌃']
        },
        lateNight: {
            texts: [
                "Still awake? BMO never sleeps!",
                "Burning the midnight oil?",
                "Late night adventures! Let's go!",
                "The quiet hours are the best for thinking!"
            ],
            emojis: ['🌌', '🌠', '💫', '🔮']
        }
    };

    // Season-aware modifications
    const seasonMods: Record<Season, { prefix?: string; suffix?: string }> = {
        winter: { prefix: "Brr! Stay warm! ", suffix: " ❄️" },
        spring: { prefix: "Spring vibes! ", suffix: " 🌸" },
        summer: { prefix: "Summer mode! ", suffix: " ☀️" },
        autumn: { prefix: "Cozy season! ", suffix: " 🍂" }
    };

    // Day-specific tweaks
    if (isMonday && timeOfDay === 'morning') {
        return { greeting: "Monday motivation! Let's crush this week! 💪", emoji: '🚀' };
    }
    if (isFriday && (timeOfDay === 'afternoon' || timeOfDay === 'evening')) {
        return { greeting: "TGIF! Weekend is almost here! 🎉", emoji: '🥳' };
    }
    if (isWeekend) {
        return { greeting: "Weekend vibes! Time to relax and have fun!", emoji: '🎮' };
    }

    // Weather-aware greeting
    if (weather) {
        if (weather.condition === 'rainy') {
            return { greeting: "Perfect weather for staying cozy inside! ☔", emoji: '🌧️' };
        }
        if (weather.condition === 'snowy') {
            return { greeting: "Snow day magic! Stay warm and cozy! ❄️", emoji: '⛄' };
        }
    }

    // Pick random greeting from time-appropriate options
    const options = greetings[timeOfDay];
    const randomIndex = Math.floor(Math.random() * options.texts.length);
    let greeting = options.texts[randomIndex];
    const emoji = options.emojis[randomIndex];

    // Sometimes add season flavor
    if (Math.random() > 0.7) {
        const mod = seasonMods[season];
        if (mod.prefix) greeting = mod.prefix + greeting;
    }

    return { greeting, emoji };
}

// Get weather icon and description for display
export function getWeatherDisplay(weather: WeatherData): { icon: string; temp: string } {
    return {
        icon: weather.icon,
        temp: `${weather.temp}°C`
    };
}
