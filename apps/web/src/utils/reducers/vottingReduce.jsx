export const INITIAL_STATE = {
  react: {
    voteCount: 0,
    time: "",
  },
  angular: {
    voteCount: 0,
    time: "",
  },
  vue: {
    voteCount: 0,
    time: "",
  },
  svelte: {
    voteCount: 0,
    time: "",
  },
};

/*
    {
        type : "INCREMENT",
        name: "react",
        vote: true | false
    }

*/

export const reducer = (state, action) => {
  switch (action.type) {
    case "INCREMENT":
      // Add one vote and stamp the current time.
      return {
        ...state,
        [action.name]: {
          ...state?.[action.name],
          voteCount: Number(state?.[action.name]?.voteCount) + 1,
          time: action.time,
        },
      };
    default:
      return {
        ...state,
      };
  }
};
