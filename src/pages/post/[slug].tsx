import { GetStaticPaths, GetStaticProps } from 'next';
import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): JSX.Element {
  return (
    <>
      <Header />

      <img src={post.data.banner.url} alt="Imagem do post" />

      <div>
        <h1>{post.data.title}</h1>
        <p>
          {post.first_publication_date} - {post.data.author}
        </p>
        {post.data.content.map(c => (
          <div key={c.heading}>
            <h3>{c.heading}</h3>
            <p>{c.body[0].text}</p>
          </div>
        ))}
      </div>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  // const prismic = getPrismicClient();
  // const posts = await prismic.query(TODO);
  // // TODO
  return {
    paths: [],
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {});

  const contents = response.data.content.map(content => ({
    heading: content.heading[0].text,
    body: [{ text: content.body[0].text }],
  }));

  const post = {
    data: {
      title: response.data.title,
      banner: { url: response.data.imagem.url },
      author: response.data.author,
      content: [...contents],
    },
    first_publication_date: new Date(
      response.last_publication_date
    ).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }),
  };

  return {
    props: {
      post,
    },
  };
};
