'use client';
import React, {useState} from 'react';
import {DragDropProvider, useDraggable, useDroppable} from '@dnd-kit/react';

function Draggable({id, label}) {
  const {ref} = useDraggable({id});

  return (
    <div
      ref={ref}
      className="px-4 py-2 bg-blue-600 text-white rounded-lg cursor-grab active:cursor-grabbing
        shadow-md hover:bg-blue-500 transition-colors select-none text-sm font-medium"
    >
      {label}
    </div>
  );
}

function Droppable({id, label, children}) {
  const {ref, isDropTarget} = useDroppable({id});

  return (
    <td
      ref={ref}
      className={`border border-gray-700 p-4 text-center align-middle min-h-[80px] h-20 transition-colors
        ${isDropTarget ? 'bg-blue-900/40 border-blue-500' : 'bg-gray-800/50'}`}
    >
      {children || <span className="text-gray-500 text-sm">{label}</span>}
    </td>
  );
}

const tasks = [
  {id: 'task-1', label: 'Design mockups'},
  {id: 'task-2', label: 'Write API endpoints'},
  {id: 'task-3', label: 'Setup CI/CD'},
  {id: 'task-4', label: 'Code review'},
];

const columns = [
  {id: 'todo', label: 'To Do'},
  {id: 'in-progress', label: 'In Progress'},
  {id: 'done', label: 'Done'},
];

export default function App() {
  const [taskParents, setTaskParents] = useState({});

  return (
    <div className="bg-black min-h-screen flex flex-col items-center p-10 text-white">
      <h1 className="text-2xl font-bold mb-2">Drag & Drop — Task Board</h1>
      <p className="text-gray-400 mb-8 text-center max-w-lg text-sm">
        Drag tasks from the pool into table columns. Uses <code className="text-blue-400">@dnd-kit/react</code> with
        DragDropProvider, useDraggable, and useDroppable hooks.
      </p>

      <DragDropProvider
        onDragEnd={(event) => {
          if (event.canceled) return;
          const taskId = event.operation.source?.id;
          const targetId = event.operation.target?.id;
          if (taskId && targetId) {
            setTaskParents((prev) => ({...prev, [taskId]: targetId}));
          }
        }}
      >
        {/* Unassigned task pool */}
        <div className="mb-8 w-full max-w-2xl">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Task Pool</h2>
          <div className="flex flex-wrap gap-3 min-h-[48px] p-4 rounded-lg border border-dashed border-gray-700 bg-gray-900/50">
            {tasks
              .filter((t) => !taskParents[t.id])
              .map((task) => (
                <Draggable key={task.id} id={task.id} label={task.label} />
              ))}
            {tasks.every((t) => taskParents[t.id]) && (
              <span className="text-gray-500 text-sm italic">All tasks assigned</span>
            )}
          </div>
        </div>

        {/* Table board */}
        <div className="w-full max-w-2xl overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.id}
                    className="border border-gray-700 bg-gray-900 px-4 py-3 text-sm font-semibold uppercase tracking-wider text-gray-300"
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {columns.map((col) => {
                  const colTasks = tasks.filter((t) => taskParents[t.id] === col.id);
                  return (
                    <Droppable key={col.id} id={col.id} label={`Drop here`}>
                      {colTasks.length > 0 && (
                        <div className="flex flex-col gap-2 items-center">
                          {colTasks.map((task) => (
                            <Draggable key={task.id} id={task.id} label={task.label} />
                          ))}
                        </div>
                      )}
                    </Droppable>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Reset */}
        <button
          onClick={() => setTaskParents({})}
          className="mt-6 px-4 py-2 text-sm rounded border border-gray-600 text-gray-400 hover:text-white hover:border-gray-400 transition-colors"
        >
          Reset Board
        </button>
      </DragDropProvider>
    </div>
  );
}
