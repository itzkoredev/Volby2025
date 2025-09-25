import type { NextPageContext } from 'next';

interface ErrorPageProps {
  statusCode?: number;
}

function ErrorPage({ statusCode }: ErrorPageProps) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        fontFamily: 'sans-serif',
      }}
    >
      <h1 style={{ fontSize: '2rem', margin: 0 }}>{statusCode ?? 'Error'}</h1>
      <p style={{ margin: 0 }}>Something went wrong.</p>
    </div>
  );
}

ErrorPage.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res?.statusCode ?? err?.statusCode ?? 404;
  return { statusCode };
};

export default ErrorPage;
