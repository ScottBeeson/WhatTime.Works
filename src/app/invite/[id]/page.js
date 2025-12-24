import { db } from '@/lib/db';
import ParticipantView from '@/components/ParticipantView';

export default async function InvitePage({ params }) {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const invite = await db.getInvite(id);

    if (!invite) {
        return (
            <div className="container text-center" style={{ paddingTop: '4rem' }}>
                <h1>Invalid Invite</h1>
            </div>
        );
    }

    return <ParticipantView invite={invite} event={invite.event} />;
}
