export default function Panel({ title, children }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <h2 className="border-b border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">{title}</h2>
      <div className="p-4">{children}</div>
    </section>
  );
}
