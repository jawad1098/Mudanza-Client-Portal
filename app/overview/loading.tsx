export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-28 bg-gray-100 rounded-xl" />
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-gray-100 rounded-xl" />)}
      </div>
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-7 space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="h-20 bg-gray-100 rounded-xl" />)}
        </div>
        <div className="col-span-5 h-80 bg-gray-100 rounded-xl" />
      </div>
    </div>
  )
}
