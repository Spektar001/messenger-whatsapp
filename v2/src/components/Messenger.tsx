import React, { useEffect, useState } from "react";
import "./Messenger.css";

interface Notification {
  id: string;
  message: string;
  senderName: string;
}

interface OutGoingMessages {
  id: string;
  sendText: string;
}

export const Messenger = () => {
  const [idInstanse, setIdInstanse] = useState("");
  const [apiToken, setApiToken] = useState("");
  const [numPhone, setNumPhone] = useState("");
  const [textMessage, setTextMessage] = useState("");

  const [outGoingMessage, setOutGoingMessage] = useState<OutGoingMessages[]>(
    []
  );

  const [notifications, setNotifications] = useState<Notification[]>([]);

  const sendMessage = async () => {
    try {
      const response = await fetch(
        `https://api.green-api.com/waInstance${idInstanse}/sendMessage/${apiToken}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chatId: `${numPhone}@c.us`,
            message: textMessage,
          }),
        }
      );
      const message = await response.json();

      const newOutGoingMessage: OutGoingMessages = {
        id: message.idMessage,
        sendText: textMessage,
      };
      setOutGoingMessage([...outGoingMessage, newOutGoingMessage]);
      setTextMessage("");
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (idInstanse && apiToken) {
      const checkNotification = async () => {
        try {
          const response = await fetch(
            `https://api.green-api.com/waInstance${idInstanse}/ReceiveNotification/${apiToken}`
          );
          const data = await response.json();
          if (data) {
            const newNotification: Notification = {
              id: data.receiptId,
              message: data.body.messageData.textMessageData.textMessage,
              senderName: data.body.senderData.senderName,
            };
            await deleteNotification(data.receiptId);
            setNotifications([...notifications, newNotification]);
          }
        } catch (error) {
          console.error(error);
        }
      };

      const deleteNotification = async (receiptId: string): Promise<void> => {
        try {
          await fetch(
            `https://api.green-api.com/waInstance${idInstanse}/DeleteNotification/${apiToken}/${receiptId}`,
            {
              method: "DELETE",
            }
          );
        } catch (error) {
          console.error(error);
        }
      };

      let intervalId: NodeJS.Timeout;

      const startChecking = () => {
        checkNotification();
        intervalId = setInterval(checkNotification, 5000);
      };

      startChecking();

      return () => clearInterval(intervalId);
    }
  }, [notifications, idInstanse, apiToken]);

  const handleClick = () => {
    if (textMessage && numPhone) {
      sendMessage();
    }
  };

  return (
    <div className="chat__container">
      <div className="header">
        <h1 className="header__title">Messenger</h1>
        <div className="info">
          <input
            value={idInstanse}
            onChange={(e) => setIdInstanse(e.target.value)}
            className="info__input"
            placeholder="IdInstance"
            type="text"
          />
          <input
            value={apiToken}
            onChange={(e) => setApiToken(e.target.value)}
            className="info__input"
            placeholder="ApiTokenInstance"
            type="text"
          />
          <input
            value={numPhone}
            onChange={(e) => setNumPhone(e.target.value)}
            className="info__input"
            placeholder="Phone"
            type="text"
          />
        </div>
      </div>
      <div className="chat">
        <div className="chat__side left__side">
          {notifications.map((notification) => (
            <p className="get__message" key={notification.id}>
              {notification.senderName}: {notification.message}
            </p>
          ))}
        </div>
        <div className="chat__side right__side">
          {outGoingMessage.map((message) => (
            <p key={message.id} className="send__message">
              {message.sendText}
            </p>
          ))}
        </div>
      </div>
      <div className="message__container">
        <input
          className="message__input"
          type="text"
          placeholder="Type a message"
          value={textMessage}
          onChange={(e) => setTextMessage(e.target.value)}
        />
        <button onClick={handleClick} className="btnSend">
          Send
        </button>
      </div>
    </div>
  );
};
