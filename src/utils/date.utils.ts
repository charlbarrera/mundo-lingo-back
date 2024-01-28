import {parseArguments} from "../index";

export function getDateEvent() {
    const args = parseArguments();
    const eventDate = args.date;
    return eventDate;
}

export function getLastTuesday(): string {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = (dayOfWeek < 2 ? -6 : 2) - dayOfWeek;
    const lastTuesday = new Date(today.getFullYear(), today.getMonth(), today.getDate() + diff);
    return lastTuesday.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    }).replace(/\//g, '-');
}
