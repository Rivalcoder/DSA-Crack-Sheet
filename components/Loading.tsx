import styles from './Loading.module.css';

export default function Loading() {
    return (
        <div className={styles.loadingWrapper}>
            <div className={styles.spinner} />
            <p className="text-muted text-sm">Loading...</p>
        </div>
    );
}
