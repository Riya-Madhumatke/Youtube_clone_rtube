import ChannelHeader from "@/components/ChannelHeader";
import Channeltabs from "@/components/Channeltabs";
import ChannelVideos from "@/components/ChannelVideos";
import VideoUploader from "@/components/VideoUploader";
import { useUser } from "@/lib/AuthContext";
import { notFound } from "next/navigation";
import { useRouter } from "next/router";
import React from "react";
import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axiosinstance";

const index = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useUser();

  try {
  const [channel, setChannel] = useState<any>(null);
  useEffect(() => {
  if (!id) return;

  const fetchChannel = async () => {
    try {
      const res = await axiosInstance.get(`/user/${id}`);
      setChannel(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  fetchChannel();
}, [id]);
    const [videos, setVideos] = useState<any[]>([]);
    useEffect(() => {
  const fetchVideos = async () => {
    try {
const res = await axiosInstance.get(`/video/channel/${id}`);    
  setVideos(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  fetchVideos();
}, []);
if (!channel) {
  return <div>Loading channel...</div>;
}
    return (
      <div className="flex-1 min-h-screen bg-white">
        <div className="max-w-full mx-auto">
          <ChannelHeader channel={channel} user={user} />
          <Channeltabs />
          <div className="px-4 pb-8">
            <VideoUploader channelId={id} channelName={channel?.channelname} />
          </div>
          <div className="px-4 pb-8">
            <ChannelVideos videos={videos} />
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error fetching channel data:", error);
   
  }
};

export default index;