import { CropperMount } from './CropperMount';

export default function Page() {
  return (
    <main className="page-shell">
      <section className="demo-header">
        <h1>Cropper.js React Wrapper</h1>
        <p>
          A focused Next.js demo that renders the local package build in the
          browser.
        </p>
      </section>

      <section className="cropper-stage" aria-label="Cropper demo">
        <CropperMount />
      </section>
    </main>
  );
}
