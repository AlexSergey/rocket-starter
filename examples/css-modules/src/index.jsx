import React from 'react';
import { render } from 'react-dom';
import styles from './styles.scss'

render(<div>
    <div className={styles.block}>
        <h1>Test</h1>
    </div>
</div>, document.getElementById('root'));
