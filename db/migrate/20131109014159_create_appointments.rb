class CreateAppointments < ActiveRecord::Migration
  def change
    create_table :appointments do |t|
      t.integer :year
      t.integer :month
      t.integer :day
      t.text :desciption
      t.string :time

      t.timestamps
    end
  end
end
