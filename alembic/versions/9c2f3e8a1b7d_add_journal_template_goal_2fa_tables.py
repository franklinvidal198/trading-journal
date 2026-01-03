"""Add journal, template, goal, and 2fa tables

Revision ID: 9c2f3e8a1b7d
Revises: 8b380ad20b58
Create Date: 2025-01-08 14:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel

# revision identifiers, used by Alembic.
revision: str = '9c2f3e8a1b7d'
down_revision: Union[str, None] = '8b380ad20b58'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create journal_entry table
    op.create_table('journalentry',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('trade_id', sa.Integer(), nullable=True),
    sa.Column('entry_type', sa.Enum('ANALYSIS', 'MISTAKE', 'SUCCESS', 'STRATEGY', name='journalentrytype'), nullable=False),
    sa.Column('pair', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
    sa.Column('title', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
    sa.Column('content', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
    sa.Column('tags', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.Column('updated_at', sa.DateTime(), nullable=False),
    sa.ForeignKeyConstraint(['user_id'], ['user.id'], ),
    sa.ForeignKeyConstraint(['trade_id'], ['trade.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    
    # Create trade_template table
    op.create_table('tradetemplate',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('name', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
    sa.Column('pair', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
    sa.Column('trade_type', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
    sa.Column('entry_strategy', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
    sa.Column('exit_strategy', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
    sa.Column('risk_reward', sa.Float(), nullable=True),
    sa.Column('description', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
    sa.Column('tags', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
    sa.Column('usage_count', sa.Integer(), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.Column('updated_at', sa.DateTime(), nullable=False),
    sa.ForeignKeyConstraint(['user_id'], ['user.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    
    # Create trading_goal table
    op.create_table('tradinggoal',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('goal_type', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
    sa.Column('period', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
    sa.Column('target_value', sa.Float(), nullable=False),
    sa.Column('current_value', sa.Float(), nullable=False),
    sa.Column('status', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
    sa.Column('progress_percentage', sa.Float(), nullable=False),
    sa.Column('is_on_track', sa.Boolean(), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.Column('updated_at', sa.DateTime(), nullable=False),
    sa.ForeignKeyConstraint(['user_id'], ['user.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    
    # Create trade_streak table
    op.create_table('tradestreak',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('streak_type', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
    sa.Column('current_count', sa.Integer(), nullable=False),
    sa.Column('best_count', sa.Integer(), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.Column('updated_at', sa.DateTime(), nullable=False),
    sa.ForeignKeyConstraint(['user_id'], ['user.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    
    # Create two_factor_auth table
    op.create_table('twofactorauth',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('secret', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
    sa.Column('is_enabled', sa.Boolean(), nullable=False),
    sa.Column('backup_codes', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.Column('updated_at', sa.DateTime(), nullable=False),
    sa.ForeignKeyConstraint(['user_id'], ['user.id'], ),
    sa.PrimaryKeyConstraint('id')
    )

def downgrade() -> None:
    op.drop_table('twofactorauth')
    op.drop_table('tradestreak')
    op.drop_table('tradinggoal')
    op.drop_table('tradetemplate')
    op.drop_table('journalentry')
