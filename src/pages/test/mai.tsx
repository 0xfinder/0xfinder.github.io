import React from 'react';
import Layout from '@theme/Layout';

export default function Hello() {
  return (
    <Layout title="Hello" description="Hello React Page">
      <div
        style={{
       alignItems: 'center',
        //   height: '50vh',
        //   fontSize: '20px',
        display: 'flex',
        justifyContent: 'center',
        }}>
        <p>
        <img src={require('@site/static/img/mai.gif').default} />
        </p>
      </div>
    </Layout>
  );
}