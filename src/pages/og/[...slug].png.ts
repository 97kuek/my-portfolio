import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { readFileSync } from 'fs';
import path from 'path';

export async function getStaticPaths() {
    const posts = await getCollection('blog');
    return posts.map((post) => ({
        params: { slug: post.id },
        props: post,
    }));
}

export const GET: APIRoute = async ({ props }) => {
    const post = props;

    // Load font
    const fontPath = path.resolve('./public/fonts/atkinson-bold.woff');
    const fontData = readFileSync(fontPath);

    const markup = {
        type: 'div',
        props: {
            style: {
                display: 'flex',
                height: '100%',
                width: '100%',
                backgroundColor: '#f4f4f5',
                backgroundImage: 'radial-gradient(circle at 25px 25px, lightgray 2%, transparent 0%), radial-gradient(circle at 75px 75px, lightgray 2%, transparent 0%)',
                backgroundSize: '100px 100px',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'Atkinson',
                fontSize: 60,
                color: '#1a1b26',
                padding: '40px',
                border: '20px solid #2337ff',
            },
            children: [
                {
                    type: 'div',
                    props: {
                        style: {
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            textAlign: 'center',
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            padding: '60px',
                            borderRadius: '30px',
                            boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
                        },
                        children: [
                            {
                                type: 'div',
                                props: {
                                    style: {
                                        fontSize: 30,
                                        color: '#2337ff',
                                        marginBottom: 20,
                                        fontWeight: 'bold',
                                        letterSpacing: '0.05em',
                                    },
                                    children: 'KEITARO UEKI',
                                }
                            },
                            {
                                type: 'div',
                                props: {
                                    children: post.data.title,
                                }
                            }
                        ],
                    },
                },
            ],
        },
    };

    const svg = await satori(markup, {
        width: 1200,
        height: 630,
        fonts: [
            {
                name: 'Atkinson',
                data: fontData,
                style: 'normal',
            },
        ],
    });

    const resvg = new Resvg(svg);
    const image = resvg.render();

    return new Response(image.asPng(), {
        headers: {
            'Content-Type': 'image/png',
        },
    });
};
