import { GetStaticProps } from 'next';
import Prismic from '@prismicio/client'

import { getPrismicClient } from '../services/prismic';

import { FiCalendar, FiUser } from 'react-icons/fi'

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({next_page, results}: PostPagination) {
  return(
    <>
      <main className={commonStyles.Container}>
        { results.map( post => (
          <a href="">
          <div className={styles.postContent}>
            <h2>
              {post.data.title}
            </h2>
            <p>{post.data.subtitle}</p>
            <div className={commonStyles.info}>
              <span><FiCalendar />{format(new Date(post.first_publication_date), 'dd MMM yyyy', {locale: ptBR,})}</span>
              <span><FiUser /> {post.data.author}</span>
            </div>
          </div>
          </a>
        ))}
        
        {/* <a href="">
          <div className={styles.postContent}>
            <h2>
              Como utilizar Hooks
            </h2>
            <p>Pensando em sincronização em vez de ciclos de vida.</p>
            <div className={commonStyles.info}>
              <span><FiCalendar /> 29 ago 2021</span>
              <span><FiUser /> Mateus Warmling</span>
            </div>
          </div>
        </a> */}

        {/* <a href="">
          <div className={styles.postContent}>
            <h2>
              Como utilizar Hooks
            </h2>
            <p>Pensando em sincronização em vez de ciclos de vida.</p>
            <div className={commonStyles.info}>
              <span><FiCalendar /> 29 ago 2021</span>
              <span><FiUser /> Mateus Warmling</span>
            </div>
          </div>
        </a> */}
      
      
      </main>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query([
    Prismic.predicates.at('document.type', 'posts')
  ], {
    fetch: ['posts.title', 'posts.subtitle', 'posts.author'],
    pageSize: 1,
  })

  const posts = postsResponse.results.map(post => {
    return {
        uid: post.uid,
        first_publication_date: post.last_publication_date,
        data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      }
    };
  });

  const postPagination = {
    results: posts,
    next_page: postsResponse
  }

  return {
    props: postPagination,
  };
};
