import { useLayoutEffect } from 'react';
import sourceDocument from './template.html?raw';

export default function App() {
  useLayoutEffect(() => {
    const parsed = new DOMParser().parseFromString(sourceDocument, 'text/html');
    const source = parsed.querySelector('main.landing');
    const root = document.getElementById('top');

    if (!source || !root) return undefined;

    root.innerHTML = source.innerHTML;
    import('./legacy.js');

    return undefined;
  }, []);

  return null;
}
