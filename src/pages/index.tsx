import React from "react";
import clsx from "clsx";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import HomepageFeatures from "@site/src/components/HomepageFeatures";

import styles from "./index.module.css";

function HomepageHeader() {
    const { siteConfig } = useDocusaurusContext();
    return (
        // <header className={clsx('hero hero--primary', styles.heroBanner)}>
        <header className={clsx("hero", styles.heroBanner)}>
            <div className="container">
                <Link to="/docs/intro">
                    <img src={require("@site/static/img/bang.png").default} />
                </Link>
            </div>
        </header>
    );
}

export default function Home(): JSX.Element {
    const { siteConfig } = useDocusaurusContext();
    return (
        <Layout
            title={`${siteConfig.title}`}
            description="random posts and notes"
        >
            <HomepageHeader />
            {/* <main>
                <HomepageFeatures />
            </main> */}
        </Layout>
    );
}
