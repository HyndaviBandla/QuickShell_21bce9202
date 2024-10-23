import React, { useState, useEffect } from 'react';
import Card from './Card'; // Assuming you have the Card component
import Header from './Header'; // Header component with Display dropdown
import './KanbanBoard.css'; // Import KanbanBoard CSS for general styling
import noPriorityIcon from '../assets/No-priority.svg';
import urgentIcon from '../assets/SVG - UrgentPrioritycolour.svg';
import highPriorityIcon from '../assets/Img-HighPriority.svg';
import mediumPriorityIcon from '../assets/Img-MediumPriority.svg';
import lowPriorityIcon from '../assets/Img-LowPriority.svg';
import backlogIcon from '../assets/Backlog.svg';
import todoIcon from '../assets/To-do.svg';
import inProgressIcon from '../assets/In-Progress.svg';
import doneIcon from '../assets/Done.svg';
import cancelledIcon from '../assets/Cancelled.svg';
import addIcon from '../assets/add.svg'; // Importing add icon
import threeDotIcon from '../assets/three-dot.svg'; // Importing three-dot icon

const KanbanBoard = () => {
  const [grouping, setGrouping] = useState(localStorage.getItem('grouping') || 'status');
  const [sorting, setSorting] = useState(localStorage.getItem('sorting') || 'priority');
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [groupedTickets, setGroupedTickets] = useState({});

  const priorityLabels = {
    '0': { label: 'No priority', icon: noPriorityIcon },
    '1': { label: 'Low', icon: lowPriorityIcon },
    '2': { label: 'Medium', icon: mediumPriorityIcon },
    '3': { label: 'High', icon: highPriorityIcon },
    '4': { label: 'Urgent', icon: urgentIcon },
  };

  const statusLabels = {
    'Backlog': { icon: backlogIcon },
    'Todo': { icon: todoIcon },
    'In progress': { icon: inProgressIcon },
    'Done': { icon: doneIcon },
    'Cancelled': { icon: cancelledIcon },
  };

  const priorityOrder = ['0', '4', '3', '2', '1']; // Custom order for priority levels

  useEffect(() => {
    localStorage.setItem('grouping', grouping);
  }, [grouping]);

  useEffect(() => {
    localStorage.setItem('sorting', sorting);
  }, [sorting]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://api.quicksell.co/v1/internal/frontend-assignment');
        const data = await response.json();
        setTickets(data.tickets);
        setUsers(data.users);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const groupTickets = () => {
      const grouped = groupBy(tickets, grouping);
      if (grouping === 'status') {
        Object.keys(statusLabels).forEach((status) => {
          if (!grouped[status]) {
            grouped[status] = [];
          }
        });
      }
      setGroupedTickets(grouped);
    };

    groupTickets();
  }, [grouping, tickets]);

  const groupBy = (items, key) => {
    return items.reduce((acc, item) => {
      const groupKey = key === 'priority'
        ? priorityLabels[item[key]]?.label || 'No priority'
        : key === 'user'
        ? users.find(user => user.id === item.userId)?.name || 'Unknown User'
        : item[key] || 'Other';

      if (!acc[groupKey]) acc[groupKey] = [];
      acc[groupKey].push(item);
      return acc;
    }, {});
  };

  const orderedGroupedTickets = Object.keys(groupedTickets).sort((a, b) => {
    if (grouping === 'priority') {
      return priorityOrder.indexOf(Object.keys(priorityLabels).find(key => priorityLabels[key].label === a)) -
             priorityOrder.indexOf(Object.keys(priorityLabels).find(key => priorityLabels[key].label === b));
    }
    return 0; // Default for other groupings
  });

  const getInitials = (name) => {
    const names = name.split(' ');
    return names.length > 1 ? names[0][0] + names[1][0].toUpperCase() : names[0][0].toUpperCase()+names[0][1].toUpperCase(); // Return first letters of the first two names
  };

  return (
    <div className="kanban-board">
      <Header setGrouping={setGrouping} setSorting={setSorting} />

      <div className="kanban-columns">
        {orderedGroupedTickets.map((groupKey) => {
          const ticketCount = groupedTickets[groupKey].length;
          const user = users.find(u => u.name === groupKey);
          const priority = Object.values(priorityLabels).find(p => p.label === groupKey);
          const status = statusLabels[groupKey];

          return (
            <div key={groupKey} className="kanban-column">
              <div className="header-container">
                {grouping === 'user' && user && (
                  <div className="user-header">
                    <div className="avatar">{getInitials(user.name)}</div>
                    <h3 className="user-name">
                      {groupKey} <span className="ticket-count">({ticketCount})</span>
                    </h3>
                  </div>
                )}

                {grouping === 'priority' && (
                  <div className="user-header">
                    {priority && <img src={priority.icon} alt={`${groupKey} icon`} className="priority-icon" />}
                    <h3 className="user-name">
                      {groupKey} <span className="ticket-count">({ticketCount})</span>
                    </h3>
                  </div>
                )}

                {grouping === 'status' && (
                  <div className="user-header">
                    {status && <img src={status.icon} alt={`${groupKey} icon`} className="status-icon" />}
                    <h3 className="user-name">
                      {groupKey} <span className="ticket-count">({ticketCount})</span>
                    </h3>
                  </div>
                )}

                <div className="header-icons">
                  <img src={addIcon} alt="Add" className="icon add-icon" />
                  <img src={threeDotIcon} alt="More options" className="icon more-options-icon" />
                </div>
              </div>

              <div className="card-group">
                {groupedTickets[groupKey]
                  .sort((a, b) =>
                    sorting === 'priority' ? b.priority - a.priority : a.title.localeCompare(b.title)
                  )
                  .map((ticket) => (
                    <Card key={ticket.id} ticket={ticket} user={users.find(user => user.id === ticket.userId)} />
                  ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default KanbanBoard;
