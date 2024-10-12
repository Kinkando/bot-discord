
/**
 *
 * @param max: required
 * @param min: default 1
 * @returns random number between min and max such as random(1, 10) will random from 1 til 10
 */
export function random(max: number, min: number = 1) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
