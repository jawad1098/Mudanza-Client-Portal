export default function Loading() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 w-48 bg-gray-100 rounded-lg" />
      <div className="h-12 bg-gray-100 rounded-xl" />
      <div className="grid grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-48 bg-gray-100 rounded-xl" />)}
      </div>
    </div>
  )
}
