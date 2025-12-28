import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
    schema: ({ image }) => z.object({
        title: z.string(),
        description: z.string().optional(),
        pubDate: z.coerce.date(),
        updatedDate: z.coerce.date().optional(),
        heroImage: image().optional(),
        categories: z.array(z.string()).default([]),
        draft: z.boolean().default(false),
    }).passthrough(),
});

export const collections = { blog };