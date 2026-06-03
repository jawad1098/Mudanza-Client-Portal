export default function Loading() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 w-48 bg-gray-100 rounded-lg" />
      <div className="h-16 bg-gray-100 rounded-xl" />
      <div className="flex gap-2">
        {[...Array(6)].map((_, i) => <div key={i} className="h-8 w-24 bg-gray-100 rounded-full" />)}
      </div>
      <div className="bg-white border border-gray-100 rounded-xl p-4 space-y-2">
        {[...Array(8)].map((_, i) => <div key={i} className="h-10 bg-gray-50 rounded-lg" />)}
      </div>
    </div>
  )
}
