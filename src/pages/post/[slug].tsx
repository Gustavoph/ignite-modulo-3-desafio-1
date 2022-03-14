/* eslint-disable react/no-danger */
/* eslint-disable no-return-assign */
/* eslint-disable no-param-reassign */

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import { RichText } from 'prismic-dom';
import Prismic from '@prismicio/client';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';

// import commonStyles from '../../styles/common.module.scss';
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
  const router = useRouter();
  if (router.isFallback) {
    return <p>Carregando...</p>;
  }

  const countWords = post.data.content.reduce((total, content) => {
    const words = content.body.map(
      paragraph => paragraph.text.split(' ').length
    );
    words.map(word => (total += word));
    return total;
  }, 0);

  const readingTime = Math.ceil(countWords / 200);

  return (
    <div className={styles.postContainer}>
      <Header />
      <img
        src={post.data.banner.url}
        className={styles.banner}
        alt="Imagem do post"
      />

      <div className={styles.postContent}>
        <h1>{post.data.title}</h1>
        <div className={styles.info}>
          <span>
            <FiCalendar fontSize="2rem" />
            <p>
              {format(new Date(post.first_publication_date), 'dd LLL YYY', {
                locale: ptBR,
              })}
            </p>
            <FiUser fontSize="2rem" className={styles.space} />
            <p>{post.data.author}</p>
            <FiClock fontSize="2rem" className={styles.space} />
            <p>{readingTime} min</p>
          </span>
        </div>
        {post.data.content.map(({ heading, body }) => (
          <div key={heading}>
            <h3>{heading}</h3>
            <div
              dangerouslySetInnerHTML={{
                __html: RichText.asHtml(body),
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      pageSize: 2,
    }
  );

  const paths = posts.results.map(post => ({
    params: { slug: post.uid },
  }));

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {});
  return {
    props: {
      post: response,
    },
  };
};
