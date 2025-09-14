import TaskCard from "./TaskCard";

export default function Column({ column, isMobile }: { column: any; isMobile?: boolean }) {
  return (
    <div className={`shrink-0 ${isMobile ? 'w-[240px]' : 'w-[280px]'}`}>
      <div className={`flex items-center space-x-3 ${isMobile ? 'mb-4' : 'mb-6'}`}>
        <div 
          className="w-3 h-3 rounded-full" 
          style={{ backgroundColor: column.color || '#49C4E5' }}
        />
        <h3 className={`font-bold uppercase tracking-wider text-[#828FA3] ${isMobile ? 'text-xs' : 'text-sm'}`}>
          {column.name} ({column.tasks.length})
        </h3>
      </div>
      <div className={`flex flex-col min-h-[200px] ${isMobile ? 'gap-3' : 'gap-4'}`}>
        {column.tasks
          .sort((a: any, b: any) => a.order - b.order)
          .map((t: any) => (
            <TaskCard key={t.id} task={t} isMobile={isMobile} />
          ))}
      </div>
    </div>
  );
}
