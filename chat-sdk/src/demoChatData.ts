import type { Chat } from './types';

/** In-app demo threads when Firestore is off or rules deny access. */
export function buildDemoChatsForParticipant(participantId: string): Chat[] {
  return [
    {
      chatId: `user_${participantId}_partner_priya_sharma`,
      type: 'user-partner' as const,
      userId: participantId,
      partnerId: 'priya_sharma',
      participantIds: [participantId, 'priya_sharma'],
      participantNames: {
        [participantId]: 'You',
        priya_sharma: 'Priya Sharma',
      },
      lastMessage: 'Hi! I saw your profile and would love to connect 😊',
      lastMessageAt: new Date(Date.now() - 300_000),
      unreadCount: { [participantId]: 1, priya_sharma: 0 },
      createdAt: new Date(Date.now() - 86_400_000),
    },
    {
      chatId: `user_${participantId}_partner_rahul_verma`,
      type: 'user-partner' as const,
      userId: participantId,
      partnerId: 'rahul_verma',
      participantIds: [participantId, 'rahul_verma'],
      participantNames: {
        [participantId]: 'You',
        rahul_verma: 'Rahul Verma',
      },
      lastMessage: 'Thanks for connecting! Looking forward to chatting.',
      lastMessageAt: new Date(Date.now() - 3_600_000),
      unreadCount: { [participantId]: 0, rahul_verma: 0 },
      createdAt: new Date(Date.now() - 172_800_000),
    },
    {
      chatId: `user_${participantId}_partner_demo_partner`,
      type: 'user-partner' as const,
      userId: participantId,
      partnerId: 'demo_partner',
      participantIds: [participantId, 'demo_partner'],
      participantNames: {
        [participantId]: 'You',
        demo_partner: 'Demo Partner',
      },
      lastMessage: 'Welcome to MarryMyntra Chat! This is demo mode.',
      lastMessageAt: new Date(Date.now() - 7_200_000),
      unreadCount: { [participantId]: 0, demo_partner: 0 },
      createdAt: new Date(Date.now() - 259_200_000),
    },
  ];
}
