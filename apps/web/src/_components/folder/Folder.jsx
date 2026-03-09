import React from "react";

const Folder = ({ data }) => {
  return (
    <div>
      {data.isFolder ? (
        <>
          <div>{data.name}</div>
          <div className="ml-2">
            {data.items.map((exp) => {
              return <Folder data={exp} key={exp.id} />;
            })}
          </div>
        </>
      ) : (
        <div>{data.name}</div>
      )}
    </div>
  );
};

export default Folder;
