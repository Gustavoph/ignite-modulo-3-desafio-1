/* eslint-disable react/no-danger */
/* eslint-disable no-return-assign */
/* eslint-disable no-param-reassign */

import { GetStaticPaths, GetStaticProps } from 'next';
import { RichText } from 'prismic-dom';
import { useRouter } from 'next/router';
import Prismic from '@prismicio/client';

import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import UtteranceComment from '../../components/UtteranceComment';

import Header from '../../components/Header';
import { dateFormater, counterWords } from '../../utils';

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

  const readingTime = counterWords({ content: post.data.content });

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
            <p>{dateFormater(post.first_publication_date)}</p>
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

        <div>
          <UtteranceComment />
        </div>
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
