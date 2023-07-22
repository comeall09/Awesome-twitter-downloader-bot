import { createInlineKeyboard, InstagramLink } from '@entities/instagram';
import { IContextBot } from '@shared/config';
import { splitArray } from '@shared/utils';

import { MAX_FILE_LIMIT, MAX_VIDEOS_LIMIT } from './model/consts';

interface SendManyFileArgs {
	ctx: IContextBot;
	links: InstagramLink[];
	originalLink: string;
}

export const sendManyFiles = async ({
	ctx,
	links,
	originalLink,
}: SendManyFileArgs) => {
	const photos = links.filter(({ type }) => type === 'photo');
	const videos = links.filter(({ type }) => type === 'video');

	/** first send all photos and only 5 videos */
	const limitedVideosList = [...photos, ...videos.slice(0, MAX_VIDEOS_LIMIT)];

	const limitedLinks = splitArray(limitedVideosList, MAX_FILE_LIMIT);
	for (const list of limitedLinks) {
		await ctx.replyWithMediaGroup(
			list.map(({ type, href, source }) => {
				return {
					type,
					media: {
						url: href,
						filename: `${source}.${
							type === 'video' ? 'mp4' : 'jpg'
						}`,
					},
					parse_mode: 'HTML',
				};
			})
		);
	}

	/** send other videos links */
	await ctx.reply(
		`<a href='${originalLink}'>${ctx.i18n.t('otherVideos')} ${
			links[0].source
		}:</a>`,
		{
			reply_markup: {
				inline_keyboard: createInlineKeyboard(
					videos.slice(MAX_VIDEOS_LIMIT)
				),
			},
			parse_mode: 'HTML',
		}
	);
};
