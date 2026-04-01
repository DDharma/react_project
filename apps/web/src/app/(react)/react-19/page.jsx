'use client'
import { useActionState } from 'react'

// useActionState(action, initialState) -> [state, formAction, isPending]
// - action: async function(prevState, formData) that runs on submit
// - initialState: initial value of state before form is submitted
// - Returns: [state, formAction, isPending]
//   state    -> the return value of the action after submission
//   formAction -> pass this to <form action={formAction}>
//   isPending  -> true while the action is running

async function submitForm(_prevState, formData) {
  // Simulate server delay
  await new Promise(resolve => setTimeout(resolve, 1000))

  const name = formData.get('name')
  const message = formData.get('message')
  const category = formData.get('category')
  const priority = formData.get('priority')

  // Validation
  const errors = {}
  if (!name) errors.name = 'Name is required'
  if (!message) errors.message = 'Message is required'
  if (!category) errors.category = 'Please select a category'
  if (!priority) errors.priority = 'Please select a priority'

  if (Object.keys(errors).length > 0) {
    return { success: false, errors, values: { name, message, category, priority } }
  }

  // Success
  return {
    success: true,
    errors: {},
    values: { name, message, category, priority },
    submitted: `Received: ${name} | ${category} | ${priority}`,
  }
}

const initialState = {
  success: false,
  errors: {},
  values: { name: '', message: '', category: '', priority: '' },
  submitted: '',
}

const React19Page = () => {
  const [state, formAction, isPending] = useActionState(submitForm, initialState)

  return (
    <div className="bg-black min-h-screen flex flex-col items-center p-10 text-white">
      <h1 className="text-2xl font-bold mb-2">useActionState Example</h1>
      <p className="text-gray-400 mb-6 text-center max-w-md">
        React 19 hook that manages form state through an action function.
        No manual useState for loading, errors, or submitted data.
      </p>

      {state.success && (
        <div className="mb-4 p-3 rounded bg-green-900 text-green-300 max-w-md w-full text-center">
          {state.submitted}
        </div>
      )}

      <form action={formAction} className="w-full max-w-md flex flex-col gap-4">
        {/* Input */}
        <div>
          <label htmlFor="name" className="block mb-1 text-sm text-gray-300">Name</label>
          <input
            id="name"
            name="name"
            type="text"
            defaultValue={state.values.name}
            className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-600 text-white focus:outline-none focus:border-blue-500"
            placeholder="Your name"
          />
          {state.errors.name && <p className="text-red-400 text-sm mt-1">{state.errors.name}</p>}
        </div>

        {/* Textarea */}
        <div>
          <label htmlFor="message" className="block mb-1 text-sm text-gray-300">Message</label>
          <textarea
            id="message"
            name="message"
            rows={3}
            defaultValue={state.values.message}
            className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-600 text-white focus:outline-none focus:border-blue-500 resize-none"
            placeholder="Write your message..."
          />
          {state.errors.message && <p className="text-red-400 text-sm mt-1">{state.errors.message}</p>}
        </div>

        {/* Select */}
        <div>
          <label htmlFor="category" className="block mb-1 text-sm text-gray-300">Category</label>
          <select
            id="category"
            name="category"
            defaultValue={state.values.category}
            className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-600 text-white focus:outline-none focus:border-blue-500"
          >
            <option value="">-- Select category --</option>
            <option value="bug">Bug Report</option>
            <option value="feature">Feature Request</option>
            <option value="question">Question</option>
          </select>
          {state.errors.category && <p className="text-red-400 text-sm mt-1">{state.errors.category}</p>}
        </div>

        {/* Radio Buttons */}
        <fieldset>
          <legend className="mb-2 text-sm text-gray-300">Priority</legend>
          <div className="flex gap-6">
            {['low', 'medium', 'high'].map(level => (
              <label key={level} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="priority"
                  value={level}
                  defaultChecked={state.values.priority === level}
                  className="accent-blue-500"
                />
                <span className="capitalize">{level}</span>
              </label>
            ))}
          </div>
          {state.errors.priority && <p className="text-red-400 text-sm mt-1">{state.errors.priority}</p>}
        </fieldset>

        {/* Submit */}
        <button
          type="submit"
          disabled={isPending}
          className="mt-2 px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isPending ? 'Submitting...' : 'Submit'}
        </button>
      </form>

      {/* How it works explanation */}
      <div className="mt-10 max-w-md w-full text-sm text-gray-500 space-y-2">
        <p><strong className="text-gray-300">How useActionState works:</strong></p>
        <p>1. Pass an async action fn + initial state to useActionState</p>
        <p>2. It returns [state, formAction, isPending]</p>
        <p>3. Bind formAction to {"<form action={formAction}>"}</p>
        <p>4. On submit, React calls action(prevState, formData)</p>
        <p>5. Whatever the action returns becomes the new state</p>
        <p>6. isPending is true while the action is running</p>
      </div>
    </div>
  )
}

export default React19Page
