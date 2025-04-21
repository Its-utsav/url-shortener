import { nanoid } from "nanoid";

/**
 *
 * @param url Genrate short url of 8 lentgh
 * @returns {string}
 */
export const generateShortUrl = (): string => {
    return nanoid(8);
};
