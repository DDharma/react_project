import React, { use } from "react";

const TabsPage = () => {
  const [data, setData] = useState({
    profile: {
      name: "",
      email: "",
      age: "",
    },
    settings: {
      theme: "",
    },
  });
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <>
      <div className="tabs">
        
        
        {activeTab === "profile" && (
          <ProfileTab data={data} setData={setData} />
        )}
      </div>
    </>
  );
};

const ProfileTab = ({ data, setData }) => {
  return (
    <div>
      <input
        type="text"
        value={data.profile.name}
        onChange={(e) =>
          setData({
            ...data,
            profile: { ...data.profile, name: e.target.value },
          })
        }
      />
      <input
        type="text"
        value={data.profile.email}
        onChange={(e) =>
          setData({
            ...data,
            profile: { ...data.profile, email: e.target.value },
          })
        }
      />
      <input
        type="text"
        value={data.profile.age}
        onChange={(e) =>
          setData({
            ...data,
            profile: { ...data.profile, age: e.target.value },
          })
        }
      />
    </div>
  );
};

export default TabsPage;
