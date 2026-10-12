// Image and text blocks placed at fixed spots of the website, stored as JSON in site_settings.contentBlocks.
// Their photo is uploaded separately (media slot block-{placement}).

export const BLOCK_PLACEMENTS = ['home', 'send', 'receive', 'business', 'about'] as const;
export type BlockPlacement = typeof BLOCK_PLACEMENTS[number];

export interface ContentBlock {
  enabled: boolean;
  title: string;
  text: string;
  buttonLabel: string;
  buttonUrl: string;    // a page of the website (/quote) or another website (https://…); empty = no button
  imageAlt: string;     // description of the photo; empty = decorative
  imageSide: 'left' | 'right';
}

export type ContentBlocks = Partial<Record<BlockPlacement, ContentBlock>>;
