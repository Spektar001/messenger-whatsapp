import React, { useState, useEffect, useCallback } from "react";
import "./Messenger.css";

interface Notification {
  id: string;
  message: string;
}

export const Messenger = () => {
  const [idInstanse, setIdInstanse] = useState("");
  const [apiToken, setApiToken] = useState("");
  const [numPhone, setNumPhone] = useState("");

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    if (idInstanse && apiToken) {
      const checkNotification = async () => {
        try {
          const response = await fetch(
            `https://api.green-api.com/waInstance${idInstanse}/ReceiveNotification/${apiToken}`
          );
          const data = await response.json();
          if (data) {
            const newNotification = {
              id: data.receiptId,
              message: data.body.messageData.textMessageData.textMessage,
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

  const handleButtonClick = useCallback(async () => {
    const response = await fetch(
      `https://api.green-api.com/waInstance${idInstanse}/sendMessage/${apiToken}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chatId: `${numPhone}@c.us`,
          message: inputValue,
        }),
      }
    );
    const message = await response.json();
    const newNotification = {
      id: message.idMessage,
      message: inputValue,
    };
    setNotifications([...notifications, newNotification]);
    setInputValue("");
  }, [apiToken, idInstanse, inputValue, notifications, numPhone]);

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
        {notifications.map((notification) => (
          <p key={notification.id} className={notification.id.length === 16 ? "send__message" : "get__message"} >{notification.message}</p>
        ))}
      </div>
      <div className="message__container">
        <input
          className="message__input"
          type="text"
          placeholder="Type a message"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <button onClick={handleButtonClick} className="btnSend">
          Send
        </button>
      </div>
    </div>
  );
};
