export default function RecentList({ title, items }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow mt-6">
      <h3 className="font-semibold mb-2">{title}</h3>
      {items.slice(0, 5).map(item => (
        <div key={item._id} className="border-b py-2 text-sm">
          {item.title || item.department}
        </div>
      ))}
      {items.length === 0 && (
        <p className="text-gray-400 text-sm">No data</p>
      )}
    </div>
  );
}